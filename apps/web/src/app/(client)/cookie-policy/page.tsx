import { LegalLayout } from "@/components/layout/LegalLayout";

export const metadata = {
  title: "Cookie Policy | Tasteful",
  description: "Learn how Tasteful uses cookies and tracking technologies to optimize performance and personalize your cooking experience.",
};

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Tasteful uses cookies and tracking technologies to personalize content, maintain user sessions, and analyze site performance."
      lastUpdated="May 29, 2026"
    >
      <section className="space-y-6">
        <p>
          This Cookie Policy explains how <strong>Tasteful</strong> uses cookies and similar tracking technologies (such as web beacons, local storage, and tracking pixels) to enhance your browsing experience, optimize recipe page loading speed, and remember your custom preferences.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work, or work more efficiently, as well as to provide reporting information.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">2. Cookies We Use and Why</h2>
        <p>
          We use cookies for several reasons, categorised as follows:
        </p>
        <ul className="list-disc pl-6 space-y-4 text-slate-300">
          <li>
            <strong>Essential Cookies:</strong> These are strictly necessary to provide you with services available through Tasteful, such as keeping you logged into your account and securely saving session parameters.
          </li>
          <li>
            <strong>Preference Cookies:</strong> These cookies allow our platform to remember choices you make (such as dark mode preferences, recently viewed recipe list, or filters you selected).
          </li>
          <li>
            <strong>Analytics Cookies:</strong> We use aggregated tracking cookies (primarily Vercel Web Analytics) to compile statistics on how visitors interact with our pages. This helps us understand which recipes are popular and improve site layout.
          </li>
          <li>
            <strong>Advertising and Sponsorship Cookies:</strong> These cookies are used to track user interactions with our dynamic top bars, michelin promotion banners, or sponsored recipe cards to verify campaign performance.
          </li>
        </ul>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">3. Local Storage</h2>
        <p>
          In addition to cookies, Tasteful utilizes browser Local Storage to cache data locally. We store your JWT authorization token (`token`) and user settings in Local Storage to keep you signed in across browser tabs. This allows us to load pages without delays caused by continuous server validation checks.
        </p>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">4. Managing Your Cookie Choices</h2>
        <p>
          You have the right to decide whether to accept or reject cookies. Most web browsers allow you to modify your settings to accept all cookies, block specific ones, or refuse them altogether:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>To manage cookies in your browser, refer to your browser’s help menus (Chrome, Safari, Firefox, Edge).</li>
          <li>Blocking essential cookies may prevent you from logging in, saving favorite recipes, or using custom meal planning lists.</li>
        </ul>

        <h2 className="text-xl font-heading font-black text-white mt-8 mb-4">5. Contact Us</h2>
        <p>
          If you have questions about our use of cookies or tracking technologies, please contact us at <a href="mailto:privacy@tasteful.com">privacy@tasteful.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
