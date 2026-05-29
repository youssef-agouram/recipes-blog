import { LegalLayout } from "@/components/layout/LegalLayout";

export const metadata = {
  title: "Terms of Service | Tasteful",
  description: "Read the rules, rights, and terms of service that govern your use of the Tasteful recipe and blogging platform.",
};

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Welcome to Tasteful. By using our website, you agree to comply with the terms and guidelines outlined below."
      lastUpdated="May 29, 2026"
    >
      <section className="space-y-6">
        <p>
          Welcome to <strong>Tasteful</strong>. These Terms of Service ("Terms") govern your access to and use of the Tasteful website, features, recipes, articles, and comment sections. By browsing the site, registering an account, or contributing recipes, you agree to be bound by these Terms.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">1. Use of the Site</h2>
        <p>
          Tasteful provides a platform for cooking inspiration, recipe sharing, and food discussion. You agree to use the site only for lawful purposes. You are responsible for ensuring that all information you provide during registration or in user submissions is accurate and does not violate any local laws.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">2. Intellectual Property Rights</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>
            <strong>Our Content:</strong> All proprietary design systems, logos, source code, website layouts, custom graphics, and professional recipes/articles created by Tasteful staff are copyrighted and belong to Tasteful. You may not copy, republish, or distribute our design materials without prior written consent.
          </li>
          <li>
            <strong>Your Content:</strong> When you submit a recipe, rating, comment, or photo to Tasteful, you retain copyright. However, you grant Tasteful a worldwide, royalty-free, perpetual, and non-exclusive license to host, display, modify, and distribute your content across our platform.
          </li>
        </ul>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">3. User Conduct and Submissions</h2>
        <p>
          We want Tasteful to be a supportive and positive environment for home cooks. When posting comments, ratings, or submitting recipes, you agree not to post:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>Content that is plagiarized or violates intellectual property rights of other chefs or websites.</li>
          <li>Offensive, abusive, harassing, or hate-speech comments.</li>
          <li>Spam, promotional advertisements, or external links unrelated to culinary topics.</li>
          <li>Malicious scripts, viruses, or code designed to interfere with website performance.</li>
        </ul>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">4. Accuracy of Recipes and Nutritional Info</h2>
        <p>
          While we test recipes and provide nutritional breakdowns verified by advisors, cooking is subjective. Differences in ingredients, temperatures, elevations, and kitchen appliances can yield varying results. Tasteful is not liable for failed dishes, food poisoning, or inaccurate nutritional estimations. For details, please consult our <a href="/disclaimer">Disclaimer</a>.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">5. Account Termination</h2>
        <p>
          We reserve the right to suspend, disable, or delete user accounts that violate these Terms, post spam, or engage in behavior harmful to the Tasteful community.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">6. Changes to these Terms</h2>
        <p>
          Tasteful reserves the right to modify these Terms at any time. We will indicate the last updated date at the top of this document. Continued use of the website after modifications indicates your acceptance of the updated Terms.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">7. Contact Information</h2>
        <p>
          For legal inquiries, copyright notices, or general terms questions, please email us at <a href="mailto:legal@tasteful.com">legal@tasteful.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
