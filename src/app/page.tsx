"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChartBigIcon,
  HeartCrackIcon,
  HeartPulseIcon,
  MessageCircleWarning,
} from "lucide-react";
import { motion } from "framer-motion";
import { database } from "../config/firebase";
import { firestore } from "../config/firebase";
import { ref, onValue } from "firebase/database";
import { doc, setDoc, collection } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

export default function DashboardPage() {
  const [ecg, setEcg] = useState<string>("-");
  const [hr, setHr] = useState<string>("-");
  const [fall, setFall] = useState<string>("-");

  const [logs, setLogs] = useState<{ [key: string]: string }>({
    ecg: "-",
    hr: "-",
    fall: "-",
  });

  const prevValues = useRef<{ ecg: string; hr: string; fall: string }>({
    ecg: "-",
    hr: "-",
    fall: "-",
  });

  useEffect(() => {
    const dataRef = ref(database, "monitoring");
    const unsubscribe = onValue(dataRef, async (snapshot) => {
      const fetchData = snapshot.val();
      if (fetchData) {
        const now = new Date().toISOString();

        // Update local UI state
        if (fetchData.ecg && fetchData.ecg !== prevValues.current.ecg) {
          setEcg(fetchData.ecg);
          setLogs((prev) => ({ ...prev, ecg: now }));
          prevValues.current.ecg = fetchData.ecg;
        }

        if (fetchData.hr && fetchData.hr !== prevValues.current.hr) {
          setHr(fetchData.hr);
          setLogs((prev) => ({ ...prev, hr: now }));
          prevValues.current.hr = fetchData.hr;
        }

        if (fetchData.fall && fetchData.fall !== prevValues.current.fall) {
          setFall(fetchData.fall);
          setLogs((prev) => ({ ...prev, fall: now }));
          prevValues.current.fall = fetchData.fall;
        }

        // 🚨 Save only warning events
        const warnings: Array<{
          type: string;
          value: string;
          status: string;
          timestamp: string;
        }> = [];

        if (getWarning("ECG", fetchData.ecg)) {
          warnings.push({
            type: "ECG",
            value: fetchData.ecg,
            status: "warning",
            timestamp: now,
          });
        }
        if (getWarning("HR", fetchData.hr)) {
          warnings.push({
            type: "HR",
            value: fetchData.hr,
            status: "warning",
            timestamp: now,
          });
        }
        if (getWarning("Fall", fetchData.fall)) {
          warnings.push({
            type: "Fall",
            value: fetchData.fall,
            status: "warning",
            timestamp: now,
          });
        }

        // Store warnings in Firestore using a hardcoded UID
        if (warnings.length > 0) {
          try {
            const hardcodedUID = "Fy4pEk6L8nhSEfcS4MRS94Y4o373"; // ← your test UID
            const userMonitoringCollectionRef = collection(
              firestore,
              "users",
              hardcodedUID, // document ID
              "Eventlogs" // subcollection
            );

            for (const warning of warnings) {
              const newDocRef = doc(userMonitoringCollectionRef, uuidv4());
              await setDoc(newDocRef, warning);
            }

            console.log("⚠️ Warning records saved:", warnings);
          } catch (error) {
            console.error("Error saving warning data:", error);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const getWarning = (type: string, value: string) => {
    const num = parseFloat(value || "0");
    if (isNaN(num)) return false;

    switch (type) {
      case "ECG":
        return num < 60 || num > 100;
      case "HR":
        return num < 95;
      case "Fall":
        return num < 1.5;
      default:
        return false;
    }
  };

  const stats = [
    {
      title: "Fall Detection Alerts",
      value: parseFloat(fall || "0"),
      display: parseFloat(fall || "0") < 0 ? "Emergency Occurs" : "Stable...",
      icon: MessageCircleWarning,
      animation: {
        animate: { rotate: [0, -10, 10, -10, 0] },
        transition: { duration: 1, repeat: Infinity },
      },
      positive: parseFloat(fall || "0") >= 0,
      subtitle: logs.fall,
      note: "Check immediately",
      type: "Fall",
    },
    {
      title: "ECG Monitoring",
      value: parseFloat(ecg || "0"),
      display: ecg + " bpm",
      icon: HeartCrackIcon,
      animation: {
        animate: { scale: [1, 1.3, 1] },
        transition: { duration: 1, repeat: Infinity },
      },
      positive: !getWarning("ECG", ecg),
      subtitle: logs.ecg,
      note: "Monitor regularly",
      type: "ECG",
    },
    {
      title: "Pulse Oximeter",
      value: parseFloat(hr || "0"),
      display: hr + "%",
      icon: HeartPulseIcon,
      animation: {
        animate: { opacity: [1, 0.5, 1], scale: [1, 1.1, 1] },
        transition: { duration: 1.5, repeat: Infinity },
      },
      positive: !getWarning("HR", hr),
      subtitle: logs.hr,
      note: "Healthy range",
      type: "HR",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 flex flex-col items-center">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-6xl mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChartBigIcon className="w-6 h-6" />
          Dashboard
        </h1>

        <div className="flex items-center gap-4">
          {/* EventLog Icon */}
          <Link href="/eventlogs">
            <div className="cursor-pointer p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition">
              <MessageCircleWarning className="w-6 h-6 text-yellow-400" />
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-300 text-center mb-6">
        Smart Health Care System
      </h2>

      <div className="w-full flex justify-center">
        <div
          className="grid gap-4 sm:gap-6 w-full"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            maxWidth: "1200px",
          }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isWarning = getWarning(stat.type, stat.value.toString());

            return (
              <motion.div
                key={index}
                animate={isWarning ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={isWarning ? { duration: 1, repeat: Infinity } : {}}
              >
                <Card
                  className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl
                    ${
                      stat.type === "ECG"
                        ? isWarning
                          ? "bg-red-900/40 border-red-500"
                          : "bg-gradient-to-b from-zinc-900 to-black border border-zinc-800"
                        : stat.type === "HR"
                        ? isWarning
                          ? "bg-yellow-900/40 border-yellow-400"
                          : "bg-gradient-to-b from-zinc-900 to-black border border-zinc-800"
                        : stat.type === "Fall"
                        ? isWarning
                          ? "bg-red-900/40 border-red-500"
                          : "bg-gradient-to-b from-zinc-900 to-black border border-zinc-800"
                        : "bg-gradient-to-b from-zinc-900 to-black border border-zinc-800"
                    }`}
                  style={{ height: "250px", width: "100%" }}
                >
                  <CardHeader className="flex flex-row items-center justify-between w-full pb-2">
                    <CardTitle className="text-sm text-zinc-400">
                      {stat.title}
                    </CardTitle>
                    <div
                      className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stat.positive
                          ? "bg-green-900/30 text-green-400"
                          : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {stat.positive ? (
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-full text-center">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-2xl sm:text-3xl font-bold">
                      <motion.div
                        animate={stat.animation.animate}
                        transition={stat.animation.transition}
                      >
                        <Icon className="w-8 h-8 text-zinc-400" />
                      </motion.div>
                      {stat.display}
                    </div>
                    <p className="mt-2 font-medium text-sm sm:text-base">
                      Last Update: {stat.subtitle}{" "}
                      {stat.positive ? (
                        <ArrowUpRight className="w-4 h-4 inline ml-1 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 inline ml-1 text-red-400" />
                      )}
                    </p>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1 sm:mt-2">
                      {stat.note}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
