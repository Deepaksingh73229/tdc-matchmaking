export interface ClientFilters {
    query?: string;
    gender?: string;
    statusTag?: string;
    maritalStatus?: string;
    religion?: string;
    city?: string;
}

/**
 * Searches and filters a list of clients based on provided criteria.
 * This can be used on the client-side for immediate feedback or potentially on the server.
 */
export function filterAndSearchClients(clients: any[], filters: ClientFilters) {
    return clients.filter((client) => {
        // 1. Search Query (First Name, Last Name, Email, City)
        if (filters.query) {
            const searchLower = filters.query.toLowerCase();
            const matchesQuery = 
                client.firstName.toLowerCase().includes(searchLower) ||
                client.lastName.toLowerCase().includes(searchLower) ||
                client.email.toLowerCase().includes(searchLower) ||
                client.city.toLowerCase().includes(searchLower);
            
            if (!matchesQuery) return false;
        }

        // 2. Gender Filter
        if (filters.gender && filters.gender !== "All") {
            if (client.gender !== filters.gender) return false;
        }

        // 3. Status Filter
        if (filters.statusTag && filters.statusTag !== "All") {
            if (client.statusTag !== filters.statusTag) return false;
        }

        // 4. Marital Status Filter
        if (filters.maritalStatus && filters.maritalStatus !== "All") {
            if (client.maritalStatus !== filters.maritalStatus) return false;
        }

        // 5. Religion Filter
        if (filters.religion && filters.religion !== "All") {
            if (client.religion !== filters.religion) return false;
        }

        // 6. City Filter
        if (filters.city && filters.city !== "All") {
            if (client.city !== filters.city) return false;
        }

        return true;
    });
}
