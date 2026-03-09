import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

export default function PassPrintPage() {
  const { id } = useParams();
  const [pass, setPass] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest(`/passes/${id}`);
        setPass(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }
  if (!pass) {
    return <p className="text-sm text-slate-500">Loading pass...</p>;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl bg-white p-6 shadow print:shadow-none print:border print:w-full">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              College Gate Pass
            </h1>
            <p className="text-xs text-slate-600">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Pass ID: {pass._id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-800">
          <p>
            <span className="font-semibold">Student Name:</span>{" "}
            {pass.student?.name}
          </p>
          <p>
            <span className="font-semibold">Student Email:</span>{" "}
            {pass.student?.email}
          </p>
          {pass.student?.enrollmentNumber && (
            <p>
              <span className="font-semibold">Enrollment No:</span>{" "}
              {pass.student.enrollmentNumber}
            </p>
          )}
          <p>
            <span className="font-semibold">Reason:</span> {pass.reason}
          </p>
          <p>
            <span className="font-semibold">Leaving Date &amp; Time:</span>{" "}
            {new Date(pass.leaveDate).toLocaleString()}
          </p>
          {pass.expectedReturn && (
            <p>
              <span className="font-semibold">Expected Return:</span>{" "}
              {new Date(pass.expectedReturn).toLocaleString()}
            </p>
          )}
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={
                pass.status === "APPROVED"
                  ? "font-semibold text-emerald-600"
                  : pass.status === "REJECTED"
                  ? "font-semibold text-red-600"
                  : "font-semibold text-amber-600"
              }
            >
              {pass.status}
            </span>
          </p>
          {pass.status === "APPROVED" && (
            <>
              <p>
                <span className="font-semibold">Approved By:</span>{" "}
                {pass.approvedByName || pass.faculty?.name}
              </p>
              <p>
                <span className="font-semibold">Approval Date &amp; Time:</span>{" "}
                {pass.approvedAt
                  ? new Date(pass.approvedAt).toLocaleString()
                  : "-"}
              </p>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <p>Signature of Security Officer: _______________________</p>
          <p>Date: ____________________</p>
        </div>

        <div className="mt-6 flex justify-end print:hidden">
          <button onClick={handlePrint} className="btn-primary px-4 py-2 text-sm">
            Print Gate Pass
          </button>
        </div>
      </div>
    </div>
  );
}

