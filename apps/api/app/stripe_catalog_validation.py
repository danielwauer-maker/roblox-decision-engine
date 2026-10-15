def validate_price(plan_id: str, customer_type: str, plan: dict, price: dict, product: dict) -> list[str]:
    problems = []
    expected_tax_code = "txcd_10103000" if customer_type == "personal" else "txcd_10103001"
    expected_name = f"PlayDirective {plan['display_name']} - {'Personal' if customer_type == 'personal' else 'Business'}"
    if price.get("currency") != "usd": problems.append("currency must be usd")
    if price.get("unit_amount") != int(plan["monthly_price_usd"] * 100): problems.append("amount mismatch")
    if price.get("recurring", {}).get("interval") != "month" or price.get("recurring", {}).get("interval_count") != 1: problems.append("recurrence must be monthly")
    if price.get("tax_behavior") != "inclusive": problems.append("tax_behavior must be inclusive")
    product_metadata = product.get("metadata") or {}
    price_metadata = price.get("metadata") or {}
    if product.get("name") != expected_name: problems.append("product name mismatch")
    if product.get("tax_code") != expected_tax_code: problems.append("product tax_code mismatch")
    if product_metadata.get("playdirective_plan") != plan_id: problems.append("product playdirective_plan metadata mismatch")
    if product_metadata.get("playdirective_customer_type") != customer_type: problems.append("product playdirective_customer_type metadata mismatch")
    if price_metadata.get("playdirective_plan") != plan_id: problems.append("price playdirective_plan metadata mismatch")
    if price_metadata.get("playdirective_customer_type") != customer_type: problems.append("price playdirective_customer_type metadata mismatch")
    if price.get("active") is not True or product.get("active") is not True: problems.append("configured Price and Product must be active")
    return problems
