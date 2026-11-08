export function mapSubscriptionMe(dto) {
  if (!dto) return null;
  return {
    planCode: dto.planCode,
    effectivePlanCode: dto.effectivePlanCode,
    status: dto.status,
    billingInterval: dto.billingInterval,
    currentPeriodStart: dto.currentPeriodStart,
    currentPeriodEnd: dto.currentPeriodEnd,
    cancelAtPeriodEnd: Boolean(dto.cancelAtPeriodEnd),
    pendingPlanCode: dto.pendingPlanCode,
    razorpaySubscriptionIdMasked: dto.razorpaySubscriptionIdMasked,
    onboardingCompleted: dto.planCode !== 'FREE' && Boolean(dto.onboardingCompleted),
  };
}

export function mapSubscriptionEntitlements(dto) {
  return {
    effectivePlanCode: dto?.effectivePlanCode ?? 'FREE',
    capabilities: Array.isArray(dto?.capabilities) ? dto.capabilities : [],
  };
}

export function mapPlanCatalogue(dtoList) {
  if (!Array.isArray(dtoList)) return [];
  return dtoList.map((dto) => ({
    code: dto.code,
    displayName: dto.displayName,
    pricePaise: dto.pricePaise,
    priceInr: dto.priceInr,
    billingInterval: dto.billingInterval,
    capabilities: dto.capabilities ?? [],
  }));
}

export function mapCheckoutResponse(dto) {
  if (!dto) return null;
  return {
    keyId: dto.keyId,
    subscriptionId: dto.subscriptionId,
    planCode: dto.planCode,
    shortUrl: dto.shortUrl,
    status: dto.status,
  };
}

export function parseSubscriptionError(error) {
  const data = error?.response?.data;
  if (data?.code) {
    return { code: data.code, message: data.message || 'Request failed' };
  }
  if (typeof data?.message === 'string' && data.message) {
    return { code: 'UNKNOWN', message: data.message };
  }
  return { code: 'UNKNOWN', message: error?.message || 'Request failed' };
}
