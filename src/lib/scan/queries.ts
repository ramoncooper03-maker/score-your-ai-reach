/**
 * Standardized buyer-intent query set.
 *
 * The same templates run for every business so results are comparable and
 * reproducible. Query text is generated in code, never by a model.
 */

export interface QueryTemplate {
  code: string;
  intentType: string;
  /** `{service}`, `{category}`, `{city}`, `{state}` are substituted. */
  template: string;
  /** Repeat this template once per primary service. */
  perService: boolean;
}

export const QUERY_TEMPLATES: readonly QueryTemplate[] = [
  {
    code: "best_local",
    intentType: "best_in_market",
    template: "Who are the best {category} in {city}, {state}?",
    perService: false,
  },
  {
    code: "recommend",
    intentType: "recommendation",
    template: "Can you recommend a trustworthy {category} in {city}, {state}?",
    perService: false,
  },
  {
    code: "near_me",
    intentType: "proximity",
    template: "{category} near {city}, {state} with good reviews",
    perService: false,
  },
  {
    code: "service_intent",
    intentType: "service_specific",
    template: "Who should I hire for {service} in {city}, {state}?",
    perService: true,
  },
  {
    code: "service_best",
    intentType: "service_specific",
    template: "Best {service} company in {city}, {state}",
    perService: true,
  },
  {
    code: "urgent",
    intentType: "urgency",
    template: "I need {service} in {city}, {state} as soon as possible — who should I call?",
    perService: true,
  },
  {
    code: "compare",
    intentType: "comparison",
    template: "Compare the top {category} options in {city}, {state}",
    perService: false,
  },
  {
    code: "value",
    intentType: "price_value",
    template: "Affordable but reliable {category} in {city}, {state}",
    perService: false,
  },
];

export interface QueryBuildInput {
  category: string;
  city: string;
  state: string;
  primaryServices: readonly string[];
  locale?: string;
}

export interface BuiltQuery {
  code: string;
  intentType: string;
  queryText: string;
  serviceFocus: string | null;
  locale: string;
  position: number;
}

/** Deterministic: same business inputs always produce the same query list. */
export function buildStandardQueries(input: QueryBuildInput, maxServices = 3): BuiltQuery[] {
  const locale = input.locale ?? "en-US";
  const services = input.primaryServices
    .map((service) => service.trim())
    .filter(Boolean)
    .slice(0, maxServices);

  const queries: BuiltQuery[] = [];

  for (const template of QUERY_TEMPLATES) {
    const targets = template.perService ? services : [null];
    for (const service of targets) {
      if (template.perService && !service) continue;
      const queryText = template.template
        .replaceAll("{category}", input.category.trim())
        .replaceAll("{service}", service ?? input.category.trim())
        .replaceAll("{city}", input.city.trim())
        .replaceAll("{state}", input.state.trim());
      queries.push({
        code: template.code,
        intentType: template.intentType,
        queryText,
        serviceFocus: service,
        locale,
        position: queries.length,
      });
    }
  }

  return queries;
}
