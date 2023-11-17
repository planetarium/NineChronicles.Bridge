import { Planet, Registry } from "./types/registry";

export class PreloadHandler {
    private _preloaded = false;

    async preparePlanets(): Promise<Planet[]> {
        try {
            const RegistryBaseUrl = new URL(process.env.NC_REGISTRY_ENDPOINT);
            const registry: Registry = JSON.parse(
                await (await fetch(RegistryBaseUrl)).json(),
            );
            if (registry === undefined)
                throw Error("Failed to parse registry.");

            const upsteamEndpoints = registry.find(
                (v) => v.id === process.env.NC_UPSTREAM_PLANET,
            );
            const downstreamEndpoints = registry.find(
                (v) => v.id === process.env.NC_DOWNSTREAM_PLANET,
            );

            if (!upsteamEndpoints || !downstreamEndpoints) {
                throw Error("Registry does not have matching planet entry.");
            }
            this._preloaded = true;
            return [upsteamEndpoints, downstreamEndpoints];
        } catch (error) {
            console.error("PreparePlanets·failed.", error);
        }
    }

    isPreloadComplete(): boolean {
        return this._preloaded;
    }
}
