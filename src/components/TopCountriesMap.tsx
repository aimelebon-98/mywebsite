// @ts-nocheck
"use client";

import { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Globe, MapPin } from "lucide-react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRY_NAMES: Record<string, string> = {
  NG: "Nigeria", GH: "Ghana", KE: "Kenya", ZA: "South Africa", BJ: "Benin",
  BF: "Burkina Faso", CI: "Cote d'Ivoire", GW: "Guinea-Bissau", ML: "Mali",
  NE: "Niger", SN: "Senegal", TG: "Togo", CM: "Cameroon", CD: "DR Congo",
  CG: "Congo", GA: "Gabon", TD: "Chad", CF: "CAR", GQ: "Equatorial Guinea",
  MA: "Morocco", DZ: "Algeria", TN: "Tunisia", LY: "Libya", EG: "Egypt",
  SD: "Sudan", SS: "South Sudan", ET: "Ethiopia", SO: "Somalia", DJ: "Djibouti",
  ER: "Eritrea", UG: "Uganda", RW: "Rwanda", BI: "Burundi", TZ: "Tanzania",
  MW: "Malawi", MZ: "Mozambique", ZM: "Zambia", ZW: "Zimbabwe", BW: "Botswana",
  NA: "Namibia", LS: "Lesotho", SZ: "Eswatini", MG: "Madagascar", MU: "Mauritius",
  SC: "Seychelles", KM: "Comoros", AO: "Angola", LR: "Liberia", SL: "Sierra Leone",
  GM: "Gambia", MR: "Mauritania", US: "United States", GB: "United Kingdom",
  FR: "France", DE: "Germany", CA: "Canada", ES: "Spain", IT: "Italy",
  BR: "Brazil", IN: "India", CN: "China", JP: "Japan", AU: "Australia",
  RU: "Russia", MX: "Mexico", NL: "Netherlands", BE: "Belgium", CH: "Switzerland",
  PT: "Portugal", IE: "Ireland", SE: "Sweden", NO: "Norway", DK: "Denmark",
  FI: "Finland", PL: "Poland", TR: "Turkey", AE: "UAE", SA: "Saudi Arabia",
  IL: "Israel", AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru",
};

const ISO2_TO_NUM: Record<string, string> = {
  NG: "566", GH: "288", KE: "404", ZA: "710", BJ: "204", BF: "854", CI: "384",
  GW: "624", ML: "466", NE: "562", SN: "686", TG: "768", CM: "120", CD: "180",
  CG: "178", GA: "266", TD: "148", CF: "140", GQ: "226", MA: "504", DZ: "012",
  TN: "788", LY: "434", EG: "818", SD: "729", SS: "728", ET: "231", SO: "706",
  DJ: "262", ER: "232", UG: "800", RW: "646", BI: "108", TZ: "834", MW: "454",
  MZ: "508", ZM: "894", ZW: "716", BW: "072", NA: "516", LS: "426", SZ: "748",
  MG: "450", MU: "480", SC: "690", KM: "174", AO: "024", LR: "430", SL: "694",
  GM: "270", MR: "478", US: "840", GB: "826", FR: "250", DE: "276", CA: "124",
  ES: "724", IT: "380", BR: "076", IN: "356", CN: "156", JP: "392", AU: "036",
  RU: "643", MX: "484", NL: "528", BE: "056", CH: "756", PT: "620", IE: "372",
  SE: "752", NO: "578", DK: "208", FI: "246", PL: "616", TR: "792", AE: "784",
  SA: "682", IL: "376", AR: "032", CL: "152", CO: "170", PE: "604",
};

function codeToEmoji(code: string): string {
  if (!code || code.length !== 2) return "";
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  return String.fromCodePoint(A + code.charCodeAt(0) - base) + String.fromCodePoint(A + code.charCodeAt(1) - base);
}

function normalizeNumId(id: any): string {
  return String(id || "").padStart(3, "0");
}

interface CountryData { code: string; visitors: number }
interface CityData { city: string; country: string; visitors: number }

export default function TopCountriesMap({
  countries,
  cities
}: {
  countries: CountryData[];
  cities: CityData[];
}) {
  const { visitsByNumId, max, total } = useMemo(() => {
    const map: Record<string, number> = {};
    let m = 0;
    let t = 0;
    countries.forEach(d => {
      const num = ISO2_TO_NUM[d.code];
      if (num) {
        map[num] = d.visitors;
        map[normalizeNumId(num)] = d.visitors;
        map[String(parseInt(num, 10))] = d.visitors;
      }
      if (d.visitors > m) m = d.visitors;
      t += d.visitors;
    });
    return { visitsByNumId: map, max: m, total: t };
  }, [countries]);

  function getColor(numId: string): string {
    const norm = normalizeNumId(numId);
    const v = visitsByNumId[norm] || visitsByNumId[String(numId)] || visitsByNumId[String(parseInt(numId, 10))] || 0;
    if (v === 0) return "#f1f5f9";
    const intensity = Math.min(1, v / max);
    if (intensity > 0.75) return "#c2410c";
    if (intensity > 0.5) return "#ea580c";
    if (intensity > 0.25) return "#fb923c";
    if (intensity > 0.1) return "#fdba74";
    return "#fed7aa";
  }

  const maxCity = cities.length > 0 ? cities[0].visitors : 1;

  if (countries.length === 0 && cities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-slate-900">Visitor Geography</h3>
        </div>
        <div className="text-center py-12 text-slate-400 text-sm">
          No geographic data yet. Data starts capturing on new visits (bots excluded).
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-slate-900">Visitor Geography</h3>
        </div>
        <div className="text-xs text-slate-500">
          {total.toLocaleString()} visits from {countries.length} {countries.length === 1 ? "country" : "countries"}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-6">
        {/* Map */}
        <div className="min-w-0 bg-slate-50 rounded-lg overflow-hidden">
          <ComposableMap
            projectionConfig={{ scale: 140 }}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const numId = String(geo.id);
                  const fill = getColor(numId);
                  const norm = normalizeNumId(numId);
                  const v = visitsByNumId[norm] || visitsByNumId[String(numId)] || visitsByNumId[String(parseInt(numId, 10))] || 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#e2e8f0"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: v > 0 ? "#9a3412" : "#e2e8f0", outline: "none", cursor: v > 0 ? "pointer" : "default" },
                        pressed: { outline: "none" },
                      }}
                    >
                      <title>{`${geo.properties.name || "Unknown"}${v > 0 ? `: ${v} visitor${v === 1 ? "" : "s"}` : ""}`}</title>
                    </Geography>
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          <div className="flex items-center justify-center gap-2 py-3 text-[10px] text-slate-500">
            <span>Less</span>
            <div className="flex gap-0.5">
              <div className="w-4 h-3 rounded-sm" style={{ background: "#fed7aa" }} />
              <div className="w-4 h-3 rounded-sm" style={{ background: "#fdba74" }} />
              <div className="w-4 h-3 rounded-sm" style={{ background: "#fb923c" }} />
              <div className="w-4 h-3 rounded-sm" style={{ background: "#ea580c" }} />
              <div className="w-4 h-3 rounded-sm" style={{ background: "#c2410c" }} />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Countries list */}
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Top Countries
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {countries.slice(0, 30).map(country => {
              const pct = max > 0 ? (country.visitors / max) * 100 : 0;
              return (
                <div key={country.code} className="group">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg flex-shrink-0" aria-hidden>{codeToEmoji(country.code)}</span>
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {COUNTRY_NAMES[country.code] || country.code}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-orange-600 flex-shrink-0">
                      {country.visitors.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Cities */}
      {cities.length > 0 && (
        <div className="border-t border-slate-100 pt-5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Top Cities
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cities.slice(0, 30).map((c, idx) => {
              const pct = maxCity > 0 ? (c.visitors / maxCity) * 100 : 0;
              return (
                <div key={`${c.city}-${c.country}-${idx}`} className="min-w-0 p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base flex-shrink-0" aria-hidden>{codeToEmoji(c.country)}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{c.city}</div>
                        <div className="text-[10px] text-slate-500 truncate">{COUNTRY_NAMES[c.country] || c.country}</div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-orange-600 flex-shrink-0">
                      {c.visitors}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}