
import { useEffect, useState } from "react";
import {get_hello} from "../api_req";


export default function HelloWorld() {
    const [message, setMessage] = useState("");
    useEffect(() => {
        async function fetchMessage() {
            const msg = await get_hello();
            setMessage(msg);
        };
        fetchMessage();
      }, []);
    

    return <h1 className="text-red-400">{message} hhahh</h1>;
}