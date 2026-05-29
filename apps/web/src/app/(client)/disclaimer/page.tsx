import { LegalLayout } from "@/components/layout/LegalLayout";

export const metadata = {
  title: "Disclaimer | Tasteful",
  description: "Read our cooking, nutritional, allergen, and sponsor disclosures before using the recipes and guides on Tasteful.",
};

export default function DisclaimerPage() {
  return (
    <LegalLayout
      title="Disclaimer"
      subtitle="Please read this disclaimer carefully before cooking our recipes or following our culinary guides."
      lastUpdated="May 29, 2026"
    >
      <section className="space-y-6">
        <p>
          The information, guides, tips, and recipes on <strong>Tasteful</strong> are provided for general educational, inspirational, and entertainment purposes only. By using our website and cooking our recipes, you assume full responsibility for your kitchen safety, diet choices, and health.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">1. Nutritional Information Disclaimer</h2>
        <p>
          We provide estimated nutritional values (such as calories, fat, protein, carbs, and sodium) for many of our recipes. These figures are calculated using automated online recipe analysis databases and should be treated as <strong>estimates</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>Nutritional content can vary significantly based on brand purchases, exact ingredient quantities, preparation methods, and serving sizes.</li>
          <li>We do not analyze recipes in a certified chemical laboratory.</li>
          <li>If you have severe medical conditions (such as diabetes, severe allergies, high blood pressure) or require strict macro tracking, you should calculate nutritional values using your own scales and ingredients.</li>
        </ul>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">2. Culinary Safety and Kitchen Hazards</h2>
        <p>
          Cooking involves hazards such as hot ovens, boiling liquids, sharp knives, raw meats, and hot oils. Tasteful cannot be held responsible for:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>Cuts, burns, grease fires, or other kitchen accidents/injuries.</li>
          <li>Food poisoning, undercooking, or foodborne illnesses resulting from raw ingredients.</li>
          <li>Kitchen appliance malfunctions or property damage.</li>
        </ul>
        <p>
          Always practice basic safety, keep fire extinguishers accessible, sanitize your hands and workspaces, and use meat thermometers to verify internal cooking temperatures.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">3. Allergen Warning</h2>
        <p>
          Many recipes on Tasteful use common food allergens such as nuts, soy, dairy, eggs, fish, shellfish, and wheat (gluten). We tag gluten-free or vegan recipes for convenience, but you must verify that all purchased ingredients, cross-contamination warnings, and brand labels are safe for your specific dietary requirements.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">4. Sponsorship and Affiliate Disclosures</h2>
        <p>
          Tasteful displays sponsored recipe cards, affiliate products, and promotional banners (such as our Michelin Masterclass subscription offer, top bar sponsorships, and display advertisements). We may receive financial compensation when you click on links, submit your email, or make a purchase from these third parties. We only promote products and services we believe add value to home cooks.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">5. Contact Us</h2>
        <p>
          If you require further clarification about our culinary disclaimers or advertiser relationships, please contact us at <a href="mailto:info@tasteful.com">info@tasteful.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
