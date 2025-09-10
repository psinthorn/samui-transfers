import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub } from "react-icons/fa";


export const Social = () => {
  return (
    <>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
            
            </span>
          </div>
        </div>
        <div className="flex gap-4">
              <button className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                  <FcGoogle className="mr-2 h-5 w-5" />
              </button>
              <button className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                  <FaFacebook className="mr-2 h-5 w-5 text-blue-600" />
              </button>
              <button className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                  <FaGithub className="mr-2 h-5 w-5 text-gray-700" />
              </button>
        </div>
    </>
  );
};
