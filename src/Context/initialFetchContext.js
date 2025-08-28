import { createContext,useState,useEffect } from "react";
import { getApartmentProperties, fetchTenantsRecords } from '../APIS/APIS';


export const fetchContext = createContext()

export const FetchContextProvider = ({children})=>{
const [apartments,setApartments] = useState([]);
const [tenants,setTenants] = useState([]);
const [loading,setLoading] = useState(false)

const fetchApartments = async()=>{
    try{
      setLoading(true)
      const res = await getApartmentProperties()
      if(res.status === 200){
        setApartments(res.data)
      }else{
        setApartments([])
      }

    }catch(err){
        console.log(err)

    }finally{
      setLoading(false)
    }
}

const fetchTenants = async()=>{
    try{
      setLoading(true)
      const res = await fetchTenantsRecords();
      if(res.status ===200){
        setTenants(res.data)
      }else{
        setTenants([])
      }
    }catch(err){
        console.log(err)
    }finally{
      setLoading(false)
    }
}

useEffect(()=>{
     setLoading(true)
     Promise.all([ fetchApartments(),fetchTenants()])
            .then(()=>{
              setLoading(false)
              console.log("Fetch Successful")
            })
            .catch((err)=>console.log(err))
},[])

return(
  <fetchContext.Provider value={{apartments,tenants,loading,fetchApartments,fetchTenants,setLoading}}>
     {children}
  </fetchContext.Provider>
)
}

