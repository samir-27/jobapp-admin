import { useState } from "react";
import { Home, Briefcase, Users, Trash2 } from "lucide-react";

const Sidebar = ({ setView }) => (
  <div className="w-64 h-screen bg-gray-900 text-white p-5 flex flex-col gap-4">
    <h1 className="text-xl font-bold">Admin Dashboard</h1>
    <button onClick={() => setView("jobs")} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded">
      <Briefcase size={20} /> Jobs
    </button>
    <button onClick={() => setView("users")} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded">
      <Users size={20} /> Users
    </button>
    <button onClick={() => setView("companies")} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded">
      <Home size={20} /> Companies
    </button>
  </div>
);

const DataTable = ({ title, data, onDelete }) => (
  <div className="p-5 w-full">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-3">{item.name}</td>
              <td className="p-3">
                <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Dashboard = () => {
  const [view, setView] = useState("jobs");

  const dummyData = {
    jobs: [{ id: 1, name: "Software Engineer" }, { id: 2, name: "Data Scientist" }],
    users: [{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Smith" }],
    companies: [{ id: 1, name: "Tech Corp" }, { id: 2, name: "Innovate Ltd" }],
  };

  const handleDelete = (id) => {
    console.log("Deleted item with ID:", id);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setView={setView} />
      <DataTable title={view.charAt(0).toUpperCase() + view.slice(1)} data={dummyData[view]} onDelete={handleDelete} />
    </div>
  );
};

export default Dashboard;