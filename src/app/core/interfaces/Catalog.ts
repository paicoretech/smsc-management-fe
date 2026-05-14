import { CatalogType } from "./CatalogType";

export interface Catalog {
    id?: number;
    state?: string;
    value?: string;
    name?: string;
    description?: string;
    version?: string;
    valueType?: string;
    catalogTypeId?: string;
    catalogType?: CatalogType;
    _type?: string;
    useGateway?: boolean;
    useSp?: boolean;
}
