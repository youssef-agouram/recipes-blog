import { LegalLayout } from "@/components/layout/LegalLayout";

export const metadata = {
  title: "Privacy Policy | Tasteful",
  description: "Learn how Tasteful collects, protects, and uses your personal data when you explore and contribute to our culinary platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="We value your privacy and are committed to protecting your personal data. Learn how we handle your information."
      lastUpdated="May 29, 2026"
    >
      <section className="space-y-6">
        <p>
          At <strong>Tasteful</strong>, we are committed to safeguarding the privacy of our visitors, home cooks, and recipe contributors. This Privacy Policy explains how we collect, use, disclose, and secure your personal data when you visit our website, use our meal planning features, or register an account.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">1. Information We Collect</h2>
        <p>
          We collect information directly from you when you interact with our platform, as well as automatically through your use of the website:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>
            <strong>Account Information:</strong> When you register an account, we collect your name, email address, password, and optionally, a profile avatar.
          </li>
          <li>
            <strong>User Contributions:</strong> Recipes, culinary stories, ratings, reviews, comments, and photos that you submit to the platform.
          </li>
          <li>
            <strong>Usage Data:</strong> We automatically collect information about how you navigate Tasteful, including pages viewed, recipes saved, search queries, and duration of visits.
          </li>
          <li>
            <strong>Device and Technical Data:</strong> IP addresses, browser types, operating systems, and cookies.
          </li>
        </ul>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to operate, maintain, and improve our platform, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>To personalize your culinary feed and recommend recipes that match your preferences.</li>
          <li>To process and display recipes, articles, and reviews you contribute.</li>
          <li>To send you newsletter digests, meal plans, or account updates (you can opt out at any time).</li>
          <li>To monitor traffic patterns, analyze user engagement, and fix technical bugs.</li>
          <li>To protect the security and integrity of our website.</li>
        </ul>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">3. Sharing and Third-Party Services</h2>
        <p>
          We do not sell your personal data. We only share information with trusted third-party providers necessary to run Tasteful:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>
            <strong>Cloudinary:</strong> We use Cloudinary to host, manage, and optimize images uploaded by administrators and users.
          </li>
          <li>
            <strong>Supabase / Prisma:</strong> Our database providers store account credentials, comments, and recipe collections securely.
          </li>
        </ul>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">4. Cookies and Tracking</h2>
        <p>
          We use cookies to keep you signed in, remember your preferences (like saved recipes or custom diets), and analyze site traffic. For detailed options on how to manage cookies, please refer to our <a href="/cookie-policy">Cookie Policy</a>.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">5. Your Data Rights</h2>
        <p>
          Depending on your location, you may have specific rights regarding your personal data:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li><strong>Access and Export:</strong> You can request a copy of the data we hold about your account.</li>
          <li><strong>Rectification:</strong> You can update your profile information directly from your settings panel.</li>
          <li><strong>Deletion:</strong> You can request that we delete your account and all associated submissions by contacting us.</li>
        </ul>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">6. Contact Us</h2>
        <p>
          If you have any questions, feedback, or concerns regarding this Privacy Policy or your data, please reach out to us at <a href="mailto:privacy@tasteful.com">privacy@tasteful.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
