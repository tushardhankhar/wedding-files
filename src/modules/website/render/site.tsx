import { WebsiteView, type WebsiteViewProps } from "./website-view";
import { MaharajaView } from "./maharaja/maharaja-view";
import { GulmoharView } from "./gulmohar/gulmohar-view";
import { AnandKarajView } from "./anand-karaj/anand-karaj-view";
import { KalyanamView } from "./kalyanam/kalyanam-view";
import { VowView } from "./vow/vow-view";
import { AfterpartyView } from "./afterparty/afterparty-view";
import { ConfettiView } from "./confetti/confetti-view";
import { LittleMiracleView } from "./little-miracle/little-miracle-view";
import { ShubhAarambhView } from "./shubh-aarambh/shubh-aarambh-view";
import { SaveTheDateView } from "./save-the-date/save-the-date-view";

/**
 * Per-theme renderer dispatch. Each flagship theme has a standalone renderer
 * with a completely custom layout while honouring the same WebsiteViewProps
 * contract (so gating, RSVP, preview and demo work unchanged). The Rajputana
 * (id "rajasthani") still uses the shared token-based WebsiteView for now.
 */
export function SiteView(props: WebsiteViewProps) {
  switch (props.theme.id) {
    case "royal":
      return <MaharajaView {...props} />;
    case "ivory": // The Gulmohar
      return <GulmoharView {...props} />;
    case "punjabi": // The Anand Karaj
      return <AnandKarajView {...props} />;
    case "south-indian": // The Kalyanam
      return <KalyanamView {...props} />;
    case "christian": // The Vow
      return <VowView {...props} />;
    case "afterparty": // The Afterparty
      return <AfterpartyView {...props} />;
    case "confetti": // The Confetti
      return <ConfettiView {...props} />;
    case "little-miracle": // The Little Miracle
      return <LittleMiracleView {...props} />;
    case "shubh-aarambh": // The Shubh Aarambh
      return <ShubhAarambhView {...props} />;
    case "save-the-date": // The Overture — Save the Date
      return <SaveTheDateView {...props} />;
    default:
      return <WebsiteView {...props} />;
  }
}
