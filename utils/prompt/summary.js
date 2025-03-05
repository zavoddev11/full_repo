export const company_detail_prompt = (siteData) => (`

Gather and summarize comprehensive information about
 this company using the following links: ${siteData}. Organize the report into structured sections,
  including Company Overview, Financials, Products/Services, 
 Leadership/Owner/Founder, Market Position, News, and Customer/Employee Insights.
 Ensure accuracy, clarity, and a professional tone.
 
 `)