import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { SolutionSection } from '../components/landing/SolutionSection';
import { InteractiveDemo } from '../components/landing/InteractiveDemo';
import { SocialFeedPreview } from '../components/landing/SocialFeedPreview';
import { ImpactStats } from '../components/landing/ImpactStats';
import { AiTechnology } from '../components/landing/AiTechnology';
import { CallToAction } from '../components/landing/CallToAction';
import { Footer } from '../components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-dark text-white selection:bg-orange-primary/30 font-sans">
      <Navbar />
      
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <InteractiveDemo />
        <SocialFeedPreview />
        <ImpactStats />
        <AiTechnology />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
