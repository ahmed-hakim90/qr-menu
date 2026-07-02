import { db } from "@/lib/db";
import { createNotification } from "@/features/notifications/services/notification-service";
import { closeSession } from "@/features/sessions/services/session-service";
import { publishRestaurantEvent } from "@/lib/events";
import { getPaymentProvider } from "@/lib/payments";
import type { PaymentProvider as PaymentProviderName, Prisma } from "@/generated/prisma";

export async function createSessionPayment(input: {
  sessionId: string;
  provider: PaymentProviderName;
  amount?: number;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
}) {
  const session = await db.tableSession.findUnique({
    where: { id: input.sessionId },
    include: { table: true },
  });

  if (!session || session.status === "CLOSED") {
    throw new Error("Session not found");
  }

  const amount = input.amount ?? session.total;
  if (amount <= 0) {
    throw new Error("Nothing to pay");
  }

  const settings = await db.settings.findUnique({
    where: { restaurantId: session.restaurantId },
  });

  const provider = getPaymentProvider(input.provider);
  const intent = await provider.createIntent({
    restaurantId: session.restaurantId,
    branchId: session.branchId,
    sessionId: session.id,
    amount,
    currency: settings?.currency ?? "EGP",
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
  });

  const payment = await db.payment.create({
    data: {
      restaurantId: session.restaurantId,
      branchId: session.branchId,
      sessionId: session.id,
      provider: input.provider,
      status: input.provider === "CASH" ? "PAID" : "PENDING",
      amount,
      currency: settings?.currency ?? "EGP",
      providerReference: intent.providerReference,
      providerCheckoutUrl: intent.checkoutUrl,
      rawResponse: intent.rawResponse as Prisma.InputJsonValue | undefined,
      paidAt: input.provider === "CASH" ? new Date() : null,
    },
  });

  if (input.provider === "CASH") {
    await closeSession(session.id);
  }

  await createNotification({
    restaurantId: session.restaurantId,
    branchId: session.branchId,
    sessionId: session.id,
    type: "PAYMENT_UPDATED",
    title: input.provider === "CASH" ? "Cash payment recorded" : "Paymob checkout created",
    body: `${session.table.name} payment ${payment.status}`,
    data: { paymentId: payment.id, provider: payment.provider },
  });

  publishRestaurantEvent({
    type: "payment.updated",
    restaurantId: session.restaurantId,
    branchId: session.branchId,
    payload: {
      paymentId: payment.id,
      sessionId: session.id,
      status: payment.status,
      provider: payment.provider,
    },
    at: new Date().toISOString(),
  });

  return payment;
}

export async function handlePaymobWebhook(payload: unknown, hmac?: string | null) {
  const provider = getPaymentProvider("PAYMOB");
  const result = await provider.verifyWebhook(payload, hmac);
  if (!result) {
    return null;
  }

  const payment = await db.payment.findFirst({
    where: {
      provider: "PAYMOB",
      providerReference: result.providerReference,
    },
  });

  if (!payment) {
    return null;
  }

  const updated = await db.payment.update({
    where: { id: payment.id },
    data: {
      status: result.status,
      rawResponse: result.rawResponse as Prisma.InputJsonValue | undefined,
      paidAt: result.status === "PAID" ? new Date() : null,
    },
  });

  if (result.status === "PAID") {
    await closeSession(payment.sessionId);
  }

  await createNotification({
    restaurantId: payment.restaurantId,
    branchId: payment.branchId,
    sessionId: payment.sessionId,
    type: "PAYMENT_UPDATED",
    title: "Paymob payment updated",
    body: `Payment ${result.status}`,
    data: { paymentId: payment.id },
  });

  publishRestaurantEvent({
    type: "payment.updated",
    restaurantId: payment.restaurantId,
    branchId: payment.branchId,
    payload: {
      paymentId: payment.id,
      sessionId: payment.sessionId,
      status: updated.status,
      provider: updated.provider,
    },
    at: new Date().toISOString(),
  });

  return updated;
}

export async function listWaitingBillSessions(restaurantId: string, branchId?: string) {
  return db.tableSession.findMany({
    where: {
      restaurantId,
      ...(branchId ? { branchId } : {}),
      status: "WAITING_BILL",
    },
    include: {
      table: true,
      orders: { include: { items: true } },
      payments: true,
    },
    orderBy: { billRequestedAt: "asc" },
  });
}
