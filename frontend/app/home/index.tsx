import {useEffect} from "react";
import axios from "axios";

export function Main() {
    const json = (url:string) => {

        axios.get(url)
            .then((res ) => {
                console.log(res.data)

            }
            )
            .catch (err => {
                console.log("Err")
            })

    }
    useEffect(()=>{
        json('http://localhost:8000')

    },[]);
    
    return (
        <>
        <p>Welcome to the home page</p>
        </>
    )
}