import Link from "next/link";
import { 
  ArrowLeft, ChefHat, Sparkles, Heart, Award, 
  Users, BookOpen, Star, ArrowRight, Compass 
} from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "About Us | TastyRecipes",
  description: "Learn about the mission, values, and talented team behind TastyRecipes, your ultimate destination for culinary inspiration.",
};

export default function AboutUsPage() {
  const metrics = [
    { value: "500+", label: "Handpicked Recipes", icon: ChefHat },
    { value: "150K+", label: "Monthly Readers", icon: Users },
    { value: "100+", label: "Expert Culinary Articles", icon: BookOpen },
    { value: "4.9★", label: "Cook Satisfaction", icon: Star }
  ];

  const coreValues = [
    {
      title: "Reliability & Quality",
      description: "Every single recipe on our platform is tested multiple times in our test kitchen to ensure it works perfectly in your kitchen.",
      icon: Award
    },
    {
      title: "Passion for Food",
      description: "We believe cooking is not a chore—it is an art form, a way to connect, and a source of pure joy.",
      icon: Heart
    },
    {
      title: "Community First",
      description: "We are building a space where home cooks can learn, share feedback, save their favorites, and grow together.",
      icon: Users
    },
    {
      title: "Inspiring Innovation",
      description: "From traditional comfort foods to modern fusion cuisine, we explore and innovate to keep your dining table exciting.",
      icon: Compass
    }
  ];

  const team = [
    {
      name: "Chef Marcus Sterling",
      role: "Founder & Culinary Director",
      bio: "With over 15 years of experience in Michelin-starred kitchens, Marcus leads our culinary vision and tests every recipe.",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&h=400&q=80"
    },
    {
      name: "Emma Wilson",
      role: "Lead Editor & Food Stylist",
      bio: "Emma crafts our gorgeous visual layouts and coordinates our written guides, translating chef techniques into easy guides.",
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&h=400&q=80"
    },
    {
      name: "Dr. Sarah Jenkins",
      role: "Lead Nutritionist & Advisor",
      bio: "Dr. Sarah verifies all nutritional breakdowns on our recipes to ensure balanced diets, healthy choices, and allergen safety.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80"
    }
  ];

  return (
    <div className="w-full bg-background text-foreground pb-24 min-h-screen">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card/30 via-card/10 to-transparent border-b border-white/5 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,158,31,0.04),transparent_60%)]"></div>
        
        <div className="container mx-auto px-6 max-w-[1536px] relative z-10 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.25em] text-primary hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Our Mission & Story
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none font-heading mb-6">
            We Cook with <span className="text-primary">Love</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            TastyRecipes was born out of a simple idea: to make gourmet cooking accessible to everyone. We combine expert techniques with clear, easy-to-follow instructions so you can create restaurant-quality meals at home.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-[1536px]">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-20">
          <div className="lg:col-span-6 relative aspect-[16/10] lg:aspect-auto lg:h-[480px] rounded-[48px] overflow-hidden border border-white/5 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80"
              alt="Kitchen cooking background"
              fill
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-4">How it Started</span>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-6 font-heading">
              Creating Kitchen Joy Since 2024
            </h2>
            <p className="text-xs text-muted-foreground leading-loose font-medium mb-6">
              What started as a small personal recipe log quickly grew into a thriving community. We realized that many cooking websites make simple recipes seem overcomplicated, while others lack the precise details needed for culinary success.
            </p>
            <p className="text-xs text-muted-foreground leading-loose font-medium mb-8">
              That's why we focused on high-quality recipe curation. We write our recipes with meticulous step-by-step guides, complete nutritional data, exact prep/cook times, and chef tips so that you are supported at every step of your cooking journey.
            </p>
            <Link 
              href="/recipes"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest self-start transition-all shadow-xl hover:-translate-y-0.5 hover:shadow-primary/30"
            >
              Explore Our Recipes
              <ArrowRight className="w-4 h-4 stroke-[3px]" />
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 px-8 my-24 bg-card/10 rounded-[32px] border border-white/5 backdrop-blur-sm">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="block text-2xl sm:text-4xl font-black text-white tracking-tight leading-none mb-2 font-heading">
                  {metric.value}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {metric.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Core Values */}
        <div className="my-24">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-4 block">Our Values</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter font-heading">
              What We Believe In
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreValues.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div 
                  key={idx}
                  className="flex gap-5 bg-card/15 rounded-2xl p-6 border border-white/5 hover:border-white/10 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-primary shrink-0">
                    <Icon className="w-6 h-6 stroke-[1.5px]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">
                      {value.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meet the Team */}
        <div className="my-24">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-4 block">Meet the Minds</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter font-heading">
              Our Expert Culinary Team
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div 
                key={idx}
                className="group/team flex flex-col items-center text-center bg-card/20 rounded-[32px] p-6 border border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-6 border-2 border-white/10 group-hover/team:border-primary transition-colors duration-500">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover/team:scale-105 transition-transform duration-[1s]"
                  />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1 group-hover/team:text-primary transition-colors">
                  {member.name}
                </h3>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-4 block">
                  {member.role}
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
