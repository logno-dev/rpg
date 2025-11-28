import { json } from "@solidjs/router";
import { getSubAreasInRegion } from "~/lib/game";

export async function GET(event: { request: Request }) {
  const url = new URL(event.request.url);
  const regionId = parseInt(url.searchParams.get('regionId') || '0');

  if (!regionId) {
    return json({ error: 'Region ID required' }, { status: 400 });
  }

  try {
    const subAreas = await getSubAreasInRegion(regionId);
    return json({ subAreas });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
