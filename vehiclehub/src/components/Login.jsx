import React from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {

    const {setShowLogin, axios, setToken, fetchUser, authRole, setAuthRole, navigate} = useAppContext()

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);

    // The account role model only knows "user" / "owner" — the UI calls the former "Customer".
    const accountRole = authRole === 'owner' ? 'owner' : 'user'

    const onSubmitHandler = async (event)=>{
        event.preventDefault();
        try {
            const url = state === 'login' ? '/api/user/login' : '/api/user/register'
            const payload = state === 'login' ? { email, password, role: accountRole } : { name, email, password, role: accountRole }

            const {data} = await axios.post(url, payload)

            if (!data.success) {
                toast.error(data.message || 'Authentication failed')
                return
            }

            const token = data.token
            setToken(token)
            localStorage.setItem('token', token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            const loggedInUser = await fetchUser()
            setShowLogin(false)
            navigate(loggedInUser?.role === 'owner' ? '/owner' : '/')
            toast.success(state === 'login' ? 'Logged in successfully' : 'Account created')
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Request failed')  
        }
    }

  return (

    <div onClick={() => setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-600 dark:text-gray-300 bg-black/50'>
    <form onSubmit={onSubmitHandler} onClick={(e)=>e.stopPropagation()} className='flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-88 text-gray-500 dark:text-gray-400 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black'>
            <p className="text-2xl font-medium m-auto dark:text-white">
                <span className="text-primary">{authRole === "owner" ? "Owner" : "User"}</span> {state === "login" ? "Login" : "Sign Up"}
            </p>
            <div className="flex w-full border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <button
                    type="button"
                    onClick={() => setAuthRole("customer")}
                    className={`w-1/2 py-2 text-sm cursor-pointer transition-all ${authRole === "customer" ? "bg-primary text-white" : "bg-transparent dark:text-gray-300"}`}
                >
                    {state === "login" ? "Login as Customer" : "Sign up as Customer"}
                </button>
                <button
                    type="button"
                    onClick={() => setAuthRole("owner")}
                    className={`w-1/2 py-2 text-sm cursor-pointer transition-all ${authRole === "owner" ? "bg-primary text-white" : "bg-transparent dark:text-gray-300"}`}
                >
                    {state === "login" ? "Login as Owner" : "Sign up as Owner"}
                </button>
            </div>
            {authRole === "owner" && (
                <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Owner accounts get access to the car listing dashboard and are kept separate from customer accounts.
                </p>
            )}
            {state === "register" && (
                <div className="w-full">
                    <p>Name</p>
                    <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" 
                    className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded w-full p-2 mt-1 outline-primary" type="text" required />
                </div>
            )}
            <div className="w-full ">
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded w-full p-2 mt-1 outline-primary" type="email" required />
            </div>
            <div className="w-full ">
                <p>Password</p>
                <div className="relative">
                    <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded w-full p-2 mt-1 pr-11 outline-primary" type={showPassword ? "text" : "password"} required />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 cursor-pointer"
                        tabIndex={-1}
                    >
                        <img src={showPassword ? assets.eye_icon : assets.eye_close_icon} alt={showPassword ? "Hide password" : "Show password"} className="w-6 h-6 dark:invert" />
                    </button>
                </div>
            </div>
            {state === "register" ? (
                <p>
                    Already have account? <span onClick={() => setState("login")} className="text-primary cursor-pointer">click here</span>
                </p>
            ) : (
                <p>
                    Create an account? <span onClick={() => setState("register")} className="text-primary cursor-pointer">click here</span>
                </p>
            )}
            <button className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer">
                {state === "register" ? "Create Account" : "Login"}
            </button>
        </form>
      
    </div>
  )
}

export default Login
