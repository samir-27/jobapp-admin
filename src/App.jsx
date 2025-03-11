import { useState, useEffect } from "react";
import { FaHome, FaBriefcase, FaUsers, FaTrash, FaEye } from "react-icons/fa";

const Sidebar = ({ setView }) => (
  <div className="w-64 h-screen bg-gray-900 text-white p-5 flex flex-col gap-4">
    <h1 className="text-xl font-bold">Admin Dashboard</h1>
    <button onClick={() => setView("jobs")} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded">
      <FaBriefcase size={20} /> Jobs
    </button>
    <button onClick={() => setView("users")} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded">
      <FaUsers size={20} /> Users
    </button>
    <button onClick={() => setView("companies")} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded">
      <FaHome size={20} /> Companies
    </button>
  </div>
);

const DataTable = ({ title, data, onDelete, onView }) => (
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
            <tr key={item._id} className="border-b">
              <td className="p-3">{item.title || item.name}</td>
              <td className="p-3 flex gap-2">
                <button onClick={() => onView(item)} className="text-blue-500 hover:text-blue-700">
                  <FaEye size={18} />
                </button>
                <button onClick={() => onDelete(item._id)} className="text-red-500 hover:text-red-700">
                  <FaTrash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const JobModal = ({ job, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
      <p className="text-gray-600 mb-4">{job.description}</p>
      <div className="space-y-2">
        <p><strong>Salary:</strong> ${job.salary}</p>
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Experience:</strong> {job.experience}</p>
        <p><strong>Company:</strong> {job.company.name}</p>
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all">
          Close
        </button>
      </div>
    </div>
  </div>
);

const UserModal = ({ user, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h2 className="text-2xl font-bold mb-2">{user.fullname}</h2>
      <img src={user.profileImg} alt={user.name} className="w-24 h-24 rounded-full mb-4" />
      <div className="space-y-2">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Address:</strong> {user.address}</p>
        <p><strong>Education:</strong> {user.education}</p>
        <p><strong>Course:</strong> {user.course}</p>
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all">
          Close
        </button>
      </div>
    </div>
  </div>
);

const CompanyModal = ({ company, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h2 className="text-2xl font-bold mb-2">{company.name}</h2>
      <img src={company.logo} alt={company.name} className="w-24 h-24 rounded-full mb-4" />
      <div className="space-y-2">
        <p><strong>Email:</strong> {company.email}</p>
        <p><strong>Address:</strong> {company.address}, {company.city}</p>
        <p><strong>Company Size:</strong> {company.companySize}</p>
        <p><strong>Slogan:</strong> {company.slogan}</p>
        <p><strong>Description:</strong> {company.description}</p>
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all">
          Close
        </button>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [view, setView] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    if (view === "jobs") {
      fetch("http://localhost:3000/jobs").then(res => res.json()).then(data => setJobs(data));
    } else if (view === "users") {
      fetch("http://localhost:3000/users").then(res => res.json()).then(data => setUsers(data));
    } else if (view === "companies") {
      fetch("http://localhost:3000/companies").then(res => res.json()).then(data => setCompanies(data));
    }
  }, [view]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setView={setView} />
      <DataTable title={view.charAt(0).toUpperCase() + view.slice(1)} data={view === "jobs" ? jobs : view === "users" ? users : companies} onDelete={() => {}} onView={view === "jobs" ? setSelectedJob : view === "users" ? setSelectedUser : setSelectedCompany} />
      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />} 
      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />} 
      {selectedCompany && <CompanyModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />} 
    </div>
  );
};

export default Dashboard;
