export function get_hello() {
    return fetch("http://localhost:3001/api/hello")
        .then((res) => res.json())
        .then((data) => data.message);
}