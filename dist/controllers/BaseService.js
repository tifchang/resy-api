import axios from "axios";
export class BaseService {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    generateFullPath = (path) => {
        const pathToUse = (path || "").trim();
        if (pathToUse.startsWith("/")) {
            return this.baseUrl + pathToUse.slice(1);
        }
        return `${this.baseUrl}/${pathToUse}`;
    };
    patch = async (path, data, config) => {
        return await axios.patch(this.generateFullPath(path), data, config);
    };
    post = async (path, data, config) => {
        return await axios.post(this.generateFullPath(path), data, config);
    };
    get = async (path, config) => {
        const fullPath = this.generateFullPath(path);
        return axios.get(fullPath, config);
    };
    delete = async (path, config) => {
        return axios.delete(this.generateFullPath(path), config);
    };
}
