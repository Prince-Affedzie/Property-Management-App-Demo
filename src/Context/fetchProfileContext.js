import { createContext,useEffect,useState ,useContext } from "react";
import { fetchProfileInfo } from "../APIS/APIS";

const profileContext = createContext()

export const ProfileContextProvider =({children})=>{

    const [profile,setProfile] = useState()
    const [loading,setLoading] = useState(false)

    const getProfile = async()=>{
        try{
          setLoading(true)
          const response = await fetchProfileInfo()
          if(response.status ===200){
            setProfile(response.data)
            console.log(response.data)
            setLoading(false)
          }
        }catch(err){
            console.log(err)
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        getProfile()
    },[])

   return(
    <profileContext.Provider value={{profile,loading,getProfile}}>
        {children}
    </profileContext.Provider>
   )
}

export const useProfileContext =()=> useContext(profileContext)