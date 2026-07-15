import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

/**
 * A print-ready, theme-coloured invitation PDF for one guest group.
 *
 * Purpose-built for paper (not a screenshot of the site): a framed cover, the
 * group's *invited* schedule, family blessings, and a prominent RSVP QR that
 * links back to the couple's live invite (a PDF can't RSVP on its own). Uses the
 * 14 standard PDF fonts (Times/Helvetica) so nothing needs embedding; the theme
 * shows through the palette. English-only for v1.
 */

export interface PdfPalette {
  paper: string;
  ink: string;
  inkSoft: string;
  heading: string;
  gold: string;
  goldLite: string;
  accent: string;
}

export interface PdfEvent {
  name: string;
  when: string;
  venue?: string;
  address?: string;
  dress?: string;
}

export interface PdfFamily {
  name: string;
  relation?: string;
  side?: "groom" | "bride";
}

export interface InvitePdfProps {
  names: string;
  initials: string;
  dateLabel: string | null;
  tagline?: string;
  groupName: string;
  events: PdfEvent[];
  families: PdfFamily[];
  qrDataUrl: string;
  inviteUrl: string;
  palette: PdfPalette;
}

export function InvitePdfDocument(props: InvitePdfProps) {
  const { names, initials, dateLabel, tagline, groupName, events, families, qrDataUrl, inviteUrl, palette: p } =
    props;
  const groomFamily = families.filter((f) => f.side !== "bride");
  const brideFamily = families.filter((f) => f.side === "bride");

  const s = StyleSheet.create({
    page: {
      backgroundColor: p.paper,
      color: p.ink,
      paddingTop: 34,
      paddingBottom: 58,
      paddingHorizontal: 48,
      fontFamily: "Helvetica",
      fontSize: 10,
      lineHeight: 1.45,
    },
    // A hairline gold frame around the whole page.
    frame: {
      position: "absolute",
      top: 22,
      left: 22,
      right: 22,
      bottom: 22,
      borderWidth: 1,
      borderColor: p.gold,
      borderStyle: "solid",
      opacity: 0.5,
    },
    center: { textAlign: "center" },
    eyebrow: {
      fontFamily: "Helvetica-Bold",
      fontSize: 8,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: p.gold,
      textAlign: "center",
    },
    monogram: {
      fontFamily: "Times-Bold",
      fontSize: 15,
      letterSpacing: 2,
      color: p.heading,
      textAlign: "center",
      marginBottom: 10,
    },
    names: {
      fontFamily: "Times-Bold",
      fontSize: 30,
      lineHeight: 1.2,
      color: p.heading,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 9,
    },
    date: {
      fontFamily: "Helvetica",
      fontSize: 10,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: p.inkSoft,
      textAlign: "center",
    },
    tagline: {
      fontFamily: "Times-Italic",
      fontSize: 11.5,
      color: p.ink,
      textAlign: "center",
      marginTop: 10,
      marginHorizontal: 20,
      lineHeight: 1.4,
    },
    rule: {
      alignSelf: "center",
      width: 84,
      borderBottomWidth: 1,
      borderBottomColor: p.gold,
      marginVertical: 15,
    },
    sectionTitle: {
      fontFamily: "Times-Bold",
      fontSize: 14,
      color: p.heading,
      textAlign: "center",
      marginBottom: 11,
    },
    // Event row
    event: {
      flexDirection: "row",
      marginBottom: 9,
      paddingBottom: 9,
      borderBottomWidth: 0.7,
      borderBottomColor: p.goldLite,
    },
    eventWhen: {
      width: 118,
      fontFamily: "Helvetica-Bold",
      fontSize: 8.5,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: p.accent,
    },
    eventBody: { flex: 1 },
    eventName: { fontFamily: "Times-Bold", fontSize: 14, color: p.heading },
    eventMeta: { color: p.inkSoft, marginTop: 2 },
    eventDress: { color: p.ink, marginTop: 3, fontFamily: "Times-Italic", fontSize: 10 },
    // Family
    familyRow: { flexDirection: "row", justifyContent: "center", gap: 28 },
    familySide: { textAlign: "center" },
    familySideLabel: {
      fontFamily: "Helvetica-Bold",
      fontSize: 7.5,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: p.accent,
      marginBottom: 6,
    },
    family: { textAlign: "center", marginBottom: 6 },
    familyRelation: {
      fontFamily: "Helvetica-Bold",
      fontSize: 7.5,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: p.gold,
    },
    familyName: { fontFamily: "Times-Bold", fontSize: 13, color: p.heading, marginTop: 2 },
    // RSVP block
    rsvp: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: p.gold,
      borderStyle: "solid",
      borderRadius: 8,
      padding: 14,
    },
    qr: { width: 82, height: 82, marginRight: 16 },
    rsvpTitle: { fontFamily: "Times-Bold", fontSize: 14, color: p.heading },
    rsvpText: { color: p.inkSoft, marginTop: 4, maxWidth: 230 },
    rsvpUrl: { color: p.accent, marginTop: 6, fontSize: 9 },
    // Footer
    footer: {
      position: "absolute",
      bottom: 26,
      left: 48,
      right: 48,
      textAlign: "center",
    },
    footerBrand: {
      fontFamily: "Helvetica-Bold",
      fontSize: 8,
      letterSpacing: 2.5,
      textTransform: "uppercase",
      color: p.gold,
    },
    footerNote: {
      fontSize: 7.5,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: p.inkSoft,
      marginTop: 4,
    },
  });

  return (
    <Document title={`${names} — Invitation`} author="Jashn">
      <Page size="A4" style={s.page}>
        <View style={s.frame} fixed />

        {/* Cover */}
        <Text style={s.monogram}>{initials}</Text>
        <Text style={s.eyebrow}>You are invited to celebrate</Text>
        <Text style={s.names}>{names}</Text>
        {dateLabel ? <Text style={s.date}>{dateLabel}</Text> : null}
        {tagline ? <Text style={s.tagline}>{tagline}</Text> : null}

        <View style={s.rule} />

        {/* Schedule (only this group's invited events) */}
        {events.length > 0 ? (
          <View>
            <Text style={s.sectionTitle}>Celebrations you&apos;re invited to</Text>
            {events.map((e, i) => (
              <View style={s.event} key={i} wrap={false}>
                <Text style={s.eventWhen}>{e.when}</Text>
                <View style={s.eventBody}>
                  <Text style={s.eventName}>{e.name}</Text>
                  {e.venue || e.address ? (
                    <Text style={s.eventMeta}>
                      {[e.venue, e.address].filter(Boolean).join(" · ")}
                    </Text>
                  ) : null}
                  {e.dress ? <Text style={s.eventDress}>{e.dress}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Families */}
        {families.length > 0 ? (
          <View>
            <View style={s.rule} />
            <View style={s.familyRow} wrap={false}>
              {groomFamily.length > 0 ? (
                <View style={s.familySide}>
                  <Text style={s.familySideLabel}>Groom&apos;s Family</Text>
                  {groomFamily.map((f, i) => (
                    <View style={s.family} key={i}>
                      <Text style={s.familyName}>{f.name}</Text>
                      {f.relation ? <Text style={s.familyRelation}>{f.relation}</Text> : null}
                    </View>
                  ))}
                </View>
              ) : null}
              {brideFamily.length > 0 ? (
                <View style={s.familySide}>
                  <Text style={s.familySideLabel}>Bride&apos;s Family</Text>
                  {brideFamily.map((f, i) => (
                    <View style={s.family} key={i}>
                      <Text style={s.familyName}>{f.name}</Text>
                      {f.relation ? <Text style={s.familyRelation}>{f.relation}</Text> : null}
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={s.rule} />

        {/* RSVP */}
        <View style={s.rsvp} wrap={false}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image has no alt */}
          <Image style={s.qr} src={qrDataUrl} />
          <View>
            <Text style={s.rsvpTitle}>Scan to open your invitation</Text>
            <Text style={s.rsvpText}>
              {groupName ? `${groupName}, view` : "View"} all the details and let us know
              you&apos;re coming — right from your phone.
            </Text>
            <Text style={s.rsvpUrl}>{inviteUrl}</Text>
          </View>
        </View>

        {/* Branding footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerBrand}>www.jointhejashn.com</Text>
          <Text style={s.footerNote}>Your celebration, beautifully invited · Jashn</Text>
        </View>
      </Page>
    </Document>
  );
}
