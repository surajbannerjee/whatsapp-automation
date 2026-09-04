export interface CategoryTemplate {
  category: string;
  template: string;
}

export const CATEGORY_TEMPLATES: Record<string, string> = {

  // 1. Cake Shop & Bakery
  "Cake Shop": `Hello Team {{name}}! 👋

I came across {{name}} on Google and really liked your custom cake collection and customer reviews. 🎂

I noticed you don't seem to have a dedicated website where customers can easily explore your cakes, flavours, designs, and pricing.

A modern, mobile-friendly website could help you showcase your work professionally and let customers enquire or place orders directly through WhatsApp—without depending entirely on third-party platforms.

I'm Suraj Banerjee, a web developer based in Kolkata, working with modern technologies like React.js and Next.js.

I'd be happy to create a free sample website concept for {{name}}, so you can see how your brand could look online.

Portfolio:
https://suraj-banerjee.vercel.app/

Would you be interested in seeing a quick demo?

Best regards,
Suraj Banerjee
📞 +91 9609618271`,

  "Bakery": `Hello Team {{name}}! 👋

I found {{name}} on Google and came across your bakery products and customer reviews. Your collection looks great! 🥐

I noticed you don't seem to have a dedicated website where customers can browse your products, check details, and contact you easily.

A clean, fast and mobile-friendly website could give your bakery a stronger online presence and make it easier for customers to enquire or order directly through WhatsApp.

I'm Suraj Banerjee, a web developer from Kolkata, currently working on React.js and Next.js projects.

I'd love to create a free sample website concept for {{name}}—no commitment, just to show you what's possible.

Portfolio:
https://suraj-banerjee.vercel.app/

Would you like me to share a quick demo?

Best regards,
Suraj Banerjee
📞 +91 9609618271`,

  // 2. Cafe & Restaurant
  "Cafe": `Hello Team {{name}}! ☕

I came across {{name}} on Google and really liked the look of your cafe and customer feedback.

These days, many customers check a cafe online before deciding where to visit. A modern website could help you showcase your menu, ambience, photos, location, offers and reservation/contact options in one place.

It can also include a direct WhatsApp enquiry option, making it easier for customers to connect with your team.

I'm Suraj Banerjee, a web developer based in Kolkata, working with React.js and Next.js.

I'd be happy to create a free website concept for {{name}} so you can see how it could look before making any decision.

Portfolio:
https://suraj-banerjee.vercel.app/

Would you be open to seeing a quick preview?

Best regards,
Suraj Banerjee
📞 +91 9609618271`,

  "Restaurant": `Hello Team {{name}}! 👋

I came across {{name}} on Google and noticed your restaurant has some great customer feedback. 🍽️

I wanted to reach out because I noticed you don't seem to have a dedicated website.

A professional restaurant website can showcase your complete menu, food photos, opening hours, location, offers and contact options—while giving customers an easy way to reach you directly through WhatsApp.

I'm Suraj Banerjee, a web developer based in Kolkata, currently working with React.js and Next.js projects.

I'd love to create a free sample website concept for {{name}} so you can see how your restaurant could look online.

Portfolio:
https://suraj-banerjee.vercel.app/

Would you like me to prepare a quick preview?

Best regards,
Suraj Banerjee
📞 +91 9609618271`,

  // 3. Gym & Fitness
  "Gym / Fitness": `Hi Team {{name}}! 💪

I came across {{name}} while looking for fitness centres on Google.

I noticed you don't seem to have a dedicated website where potential members can easily check your facilities, workout programs, trainers, membership plans and contact details.

A modern fitness website could help present your gym more professionally and make it easier for interested customers to enquire directly through WhatsApp.

I'm Suraj Banerjee, a web developer based in Kolkata, working with React.js and Next.js to build modern, responsive websites.

I'd be happy to create a free sample website concept for {{name}} so you can see how it could look.

Portfolio:
https://suraj-banerjee.vercel.app/

Would you like me to share a quick preview?

Best regards,
Suraj Banerjee
📞 +91 9609618271`,

  // 4. Salon & Spa
  "Salon / Spa": `Hello Team {{name}}! ✨

I came across {{name}} on Google and really liked the feedback around your salon and services. 💇‍♀️

I noticed you don't seem to have a dedicated website where customers can easily explore your services, pricing, offers and work portfolio.

A modern salon website could give your brand a more professional online presence and allow customers to enquire or request appointments directly through WhatsApp.

I'm Suraj Banerjee, a web developer based in Kolkata, working with React.js and Next.js.

I'd love to create a free sample website concept for {{name}}—so you can see the design before deciding anything.

Portfolio:
https://suraj-banerjee.vercel.app/

Would you be interested in seeing a quick demo?

Best regards,
Suraj Banerjee
📞 +91 9609618271`,

  // 5. Doctor / Clinic
  "Doctor Clinic": `Hello Team {{name}},

I came across {{name}} on Google Maps and wanted to reach out.

I noticed you don't seem to have a dedicated website where patients can easily find important information such as consultation timings, available services, doctor details and appointment/contact options.

A professional, fast and mobile-friendly website can make this information much easier for patients to access and can include a direct WhatsApp appointment enquiry option.

I'm Suraj Banerjee, a web developer based in Kolkata, working with React.js and Next.js.

I'd be happy to create a free sample website concept for {{name}} to demonstrate how it could look.

Portfolio:
https://suraj-banerjee.vercel.app/

Would you be open to seeing a quick preview?

Kind regards,
Suraj Banerjee
📞 +91 9609618271`,

  // 6. Real Estate
  "Real Estate": `Hello Team {{name}}! 🏢

I came across {{name}} on Google and wanted to reach out regarding your online presence.

For a real estate business, having a dedicated website can make it much easier to showcase properties, project details, photos, floor plans, locations and enquiry options in one professional place.

It can also allow potential buyers to contact your team directly through WhatsApp for property enquiries.

I'm Suraj Banerjee, a web developer based in Kolkata, working with React.js and Next.js.

I'd be happy to create a free sample landing page for {{name}} so you can see how your property listings could be presented online.

Portfolio:
https://suraj-banerjee.vercel.app/

Would you like me to prepare a quick sample?

Best regards,
Suraj Banerjee
📞 +91 9609618271`,

  // 7. Universal / Fallback
  "Universal": `Hello Team {{name}}! 👋

I came across {{name}} on Google and noticed your business has a good presence and customer feedback.

I wanted to reach out because I couldn't find a dedicated website for your business.

A modern, mobile-friendly website could help you showcase your services, products, photos, location and contact information in one professional place, while also making it easier for customers to connect with you directly through WhatsApp.

I'm Suraj Banerjee, a web developer based in Kolkata, currently working with React.js and Next.js projects.

I'd be happy to create a free sample website concept for {{name}}—no commitment, just a quick preview of what your online presence could look like.

Portfolio:
https://suraj-banerjee.vercel.app/

Would you be interested in seeing a quick demo?

Best regards,
Suraj Banerjee
📞 +91 9609618271`
};


// Category matching
export function getTemplateForCategory(category: string): string {
  if (!category?.trim()) {
    return CATEGORY_TEMPLATES["Universal"];
  }

  const cleanCat = category.trim().toLowerCase();

  // Exact / direct matches first
  const directMatch = Object.keys(CATEGORY_TEMPLATES).find(
    key => key.toLowerCase() === cleanCat
  );

  if (directMatch) {
    return CATEGORY_TEMPLATES[directMatch];
  }

  // Category keywords
  const categoryRules: Record<string, string[]> = {
    "Cake Shop": [
      "cake",
      "cakes",
      "custom cake",
      "birthday cake",
      "wedding cake",
      "pastry shop"
    ],

    "Bakery": [
      "bakery",
      "baker",
      "bake",
      "bread",
      "pastry",
      "patisserie"
    ],

    "Cafe": [
      "cafe",
      "coffee shop",
      "coffee",
      "tea shop",
      "coffeehouse",
      "coffee house"
    ],

    "Restaurant": [
      "restaurant",
      "food",
      "dining",
      "diner",
      "bistro",
      "bar & grill",
      "food court"
    ],

    "Gym / Fitness": [
      "gym",
      "fitness",
      "fitness centre",
      "fitness center",
      "workout",
      "crossfit",
      "yoga",
      "zumba"
    ],

    "Salon / Spa": [
      "salon",
      "spa",
      "beauty",
      "beauty parlour",
      "beauty parlor",
      "hair salon",
      "hair studio",
      "barber",
      "barbershop"
    ],

    "Doctor Clinic": [
      "doctor",
      "clinic",
      "hospital",
      "dental",
      "dentist",
      "medical",
      "healthcare",
      "diagnostic",
      "physician",
      "polyclinic"
    ],

    "Real Estate": [
      "real estate",
      "property",
      "property dealer",
      "property consultant",
      "builder",
      "developer",
      "realty",
      "estate agency",
      "construction"
    ]
  };

  for (const [templateKey, keywords] of Object.entries(categoryRules)) {
    const matched = keywords.some(keyword =>
      cleanCat.includes(keyword)
    );

    if (matched) {
      return CATEGORY_TEMPLATES[templateKey];
    }
  }

  return CATEGORY_TEMPLATES["Universal"];
}
