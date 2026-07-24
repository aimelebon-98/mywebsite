import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { adminSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    const session = await db.select().from(adminSessions).where(eq(adminSessions.token, token));
    if (session.length === 0) return false;
    return new Date(session[0].expiresAt) > new Date();
  } catch { return false; }
}

interface Translation {
  id: string;
  fr: string;
}

const translations: Translation[] = [
  { id: "da5d826b-510d-4e68-922c-190d3145882d", fr: "Chaussures incroyables, les meilleures que j''aie jamais poss' || chr(233) || 'd' || chr(233) || 'es!" },
  { id: "b5161912-0246-4546-a997-fb6f148e934d", fr: "Tr' || chr(232) || 's confortables mais il faut une semaine pour bien les roder correctement." },
  { id: "b8bc02c9-3133-4d2e-ad50-92318ab1c355", fr: "L''amorti est hors de ce monde. Mes pieds sont bien soutenus toute la journ' || chr(233) || 'e." },
  { id: "b5807e66-3ee0-4fdc-9009-f80b2a982dcf", fr: "J''ai achet' || chr(233) || ' deux paires imm' || chr(233) || 'diatement apr' || chr(232) || 's les avoir essay' || chr(233) || 'es. Rapport qualit' || chr(233) || '-prix incroyable." },
  { id: "dac467cb-6dbf-4d18-acba-e2f23e63efdb", fr: "Excellentes pour les longues courses. L''avant-pied large est un game changer pour moi." },
  { id: "69b6dccd-3dab-4bc6-af5b-52348912b47f", fr: "J''ai essay' || chr(233) || ' beaucoup de chaussures de course mais celles-ci sont dans une classe ' || chr(224) || ' part." },
  { id: "6aaca721-0dcb-428d-a650-52db328fdc9f", fr: "Ajustement parfait et la couleur est encore meilleure en personne que sur les photos." },
  { id: "2afe97b5-b7de-4810-9ef9-2500446b18fe", fr: "Construction solide. Je donnerais 5 ' || chr(233) || 'toiles si les lacets ' || chr(233) || 'taient l' || chr(233) || 'g' || chr(232) || 'rement plus longs." },
  { id: "3ef8a562-f675-4e3d-8fd8-39abfaecf947", fr: "Mes genoux ne me font plus mal apr' || chr(232) || 's les courses. Ces chaussures ont chang' || chr(233) || ' ma vie." },
  { id: "949b9399-b7e5-481d-9996-fd33602bd6b4", fr: "J''ai couru un semi-marathon avec elles d' || chr(232) || 's le premier jour. Z' || chr(233) || 'ro amp' || chr(244) || 'ules, z' || chr(233) || 'ro regrets." },
  { id: "df20f3c9-af27-406e-8b61-ab9f62185bb4", fr: "Le col rembourr' || chr(233) || ' donne l''impression de chaussons dans lesquels on peut courir." },
  { id: "51a3dbed-10db-4b55-a248-86d6fd5249b5", fr: "Excellente qualit' || chr(233) || ' pour le prix. Mon seul souhait est d''avoir plus d''options de couleurs." }
];

export async function POST() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return new NextResponse("Not Found", { status: 404 });

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const t of translations) {
      try {
        const fullSql = `UPDATE reviews SET comment_fr = '${t.fr}' WHERE id = '${t.id}'`;
        await db.execute(sql.raw(fullSql));
        success++;
      } catch (e) {
        failed++;
        errors.push(`: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }

    return NextResponse.json({
      success: true,
      total: translations.length,
      updated: success,
      failed,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed",
      details: error instanceof Error ? error.message : "Unknown"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: "POST as admin to translate the 12 test reviews for Comfort Stride",
    reviewCount: translations.length,
  });
}
