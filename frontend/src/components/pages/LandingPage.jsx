import Hero from "../landingPageComponents/Hero";
import Navbar from "../layout/Navbar";
import Features from "../landingPageComponents/Features";
import Metrics from "../landingPageComponents/Metrics";
import Integrations from "../landingPageComponents/Integration";
import Cta from "../landingPageComponents/Cta";
import Footer from "../landingPageComponents/Footer";

function LandingPage() {
    return(
        <div>
            <Navbar />
            <Hero />
            <Features />
            <Metrics />
            <Integrations />
            <Cta />
            <Footer />
        </div>
    )
}

export default LandingPage;