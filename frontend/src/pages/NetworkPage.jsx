import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import { UserPlus, Search  } from "lucide-react";
import FriendRequest from "../components/FriendRequest";
import UserCard from "../components/UserCard";
import RecommendedUser from "../components/RecommendedUser";
  
const NetworkPage = () => {
	const { data: user } = useQuery({ queryKey: ["authUser"] });

	const { data: connectionRequests } = useQuery({
		queryKey: ["connectionRequests"],
		queryFn: () => axiosInstance.get("/connections/requests"),
	});

	const { data: connections } = useQuery({
		queryKey: ["connections"],
		queryFn: () => axiosInstance.get("/connections"),
	});
 
    const { data: recommendedUsers } = useQuery({
        queryKey: ["recommendedUsersBig"],
        queryFn: async () => {
            const res = await axiosInstance.get("/users/suggestions?limit=50");  // Change limit to 3 or any desired number // aca cambiamos el máximo de usaurios recomendados
            return res.data;
        },
    });

	 // State to manage search input
	 const [searchTerm, setSearchTerm] = useState('');

	 // Filter recommended users based on search term with null checks
	 const filteredUsers = recommendedUsers
		 ? recommendedUsers.filter(user =>
			 (user && user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
			 (user && user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
		   )
		 : [];
	
	return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='col-span-1 lg:col-span-1'>
				<Sidebar user={user} />
			</div>
			<div className='col-span-1 lg:col-span-3'>
				<div className='bg-secondary rounded-lg shadow p-6 mb-6'>
					<h1 className='text-2xl font-bold mb-6'>Mis contactos</h1>

					{connectionRequests?.data?.length > 0 ? (
						<div className='mb-8'>
							<h2 className='text-xl font-semibold mb-2'>Solicitudes de conexión.</h2>
							<div className='space-y-4'>
								{connectionRequests.data.map((request) => (
									<FriendRequest key={request.id} request={request} />
								))}
							</div>
						</div>
					) : (
						<div className='bg-white rounded-lg shadow p-6 text-center mb-6'>
							<UserPlus size={48} className='mx-auto text-gray-400 mb-4' />
							<h3 className='text-xl font-semibold mb-2'>No hay solicitudes de conexión</h3>
							<p className='text-gray-600'>
								No tienes solicitudes de conexión por el momento.
							</p>
							<p className='text-gray-600 mt-2'>
								Explora sugerencias de conexión abajo para expandir tus contactos!
							</p>
						</div>
					)}
					
					{connections?.data?.length > 0 && (
						<div className='mb-8'>
							<h2 className='text-xl font-semibold mb-4'>Mis conexiones</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{connections.data.map((connection) => (
									<UserCard key={connection._id} user={connection} isConnection={true} />
								))}
							</div>
						</div>
					)}

					{recommendedUsers?.length > 0 && (
                        <div className='mb-8'>
                            <h2 className='text-xl font-semibold mb-4'>Sugerencias de Conexión</h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                {recommendedUsers.map((suggestedUser) => (
                                    <RecommendedUser key={suggestedUser._id} user={suggestedUser} />
                                ))}
                            </div>
                        </div>
                    )}
				</div>
			</div>
		</div>
	);
};

export default NetworkPage;