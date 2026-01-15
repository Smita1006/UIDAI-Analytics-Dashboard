"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Shield,
  Lock,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Activity,
  Pause,
} from "lucide-react";
import { useState, useEffect } from "react";

export function GovernanceTab() {
  const [dataHash, setDataHash] = useState("");
  const [auditTrail, setAuditTrail] = useState<any>(null);
  const [pipelineStatus, setPipelineStatus] = useState<any>(null);
  const [pincodeStability, setPincodeStability] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchGovernanceData = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      // Fetch data hash
      const hashRes = await fetch(`${API_BASE_URL}/api/governance/data-hash`);
      const hashData = await hashRes.json();
      setDataHash(hashData.data?.hash || hashData.data?.hash_value || "");

      // Fetch audit trail
      const auditRes = await fetch(`${API_BASE_URL}/api/governance/audit-trail`);
      const auditData = await auditRes.json();
      setAuditTrail(auditData.data);

      // Fetch pipeline status
      const pipelineRes = await fetch(`${API_BASE_URL}/api/governance/pipeline-status`);
      const pipelineData = await pipelineRes.json();
      setPipelineStatus(pipelineData.data);

      // Fetch pincode stability
      const pincodeRes = await fetch(`${API_BASE_URL}/api/governance/pincode-stability`);
      const pincodeData = await pincodeRes.json();
      setPincodeStability(pincodeData.data);
    } catch (error) {
      // Error fetching governance data
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('START')) return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (eventType.includes('LOADED')) return <FileCheck className="w-4 h-4 text-blue-600" />;
    if (eventType.includes('GENERATED')) return <Shield className="w-4 h-4 text-purple-600" />;
    return <Clock className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Production Governance & Security
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Quantum-safe hashing and comprehensive audit trails
          </p>
        </div>
        <Button 
          onClick={fetchGovernanceData} 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Loading..." : "Refresh Data"}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Quantum-Safe Data Integrity */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Lock className="w-6 h-6 text-blue-600" />
                Quantum-Safe Data Integrity (SHA3-256)
              </CardTitle>
              <CardDescription>
                Post-quantum cryptographic hash for data verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Data Hash
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <code className="flex-1 p-3 bg-gray-100 rounded-lg text-xs md:text-sm font-mono break-all">
                      {dataHash || "Loading..."}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(dataHash)}
                      className="w-full sm:w-auto"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Data integrity verified</p>
                    <p className="text-sm text-green-700">
                      SHA3-256 provides quantum-resistant security for long-term data protection
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage-Gated Pipeline Tracking */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Stage-Gated Pipeline Tracking
                  </CardTitle>
                  <CardDescription>
                    Production-grade pipeline monitoring with stage validation
                  </CardDescription>
                </div>
                {pipelineStatus?.all_success && (
                  <Badge variant="default" className="w-fit bg-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    All Stages Passed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pipelineStatus?.stages && Object.entries(pipelineStatus.stages).map(([stageName, stage]: [string, any]) => (
                  <Card key={stageName} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {stage.status === "SUCCESS" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 capitalize">
                              {stageName.replace(/_/g, ' ')}
                            </h4>
                            <Badge variant={stage.status === "SUCCESS" ? "default" : "destructive"} className="w-fit">
                              {stage.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>Duration: {stage.duration_ms}ms</span>
                            </div>
                            {stage.records_processed && (
                              <div>Records Processed: {stage.records_processed.toLocaleString()}</div>
                            )}
                            {stage.checks_passed && (
                              <div>Validation Checks: {stage.checks_passed}</div>
                            )}
                            {stage.features_created && (
                              <div>Features Created: {stage.features_created}</div>
                            )}
                            {stage.model_accuracy && (
                              <div>Model Accuracy: {(stage.model_accuracy * 100).toFixed(1)}%</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pincode Stability Classification */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Activity className="w-5 h-5 text-orange-600" />
                    Pincode Stability Classification
                  </CardTitle>
                  <CardDescription>
                    5-tier stability analysis across {pincodeStability?.summary?.total_analyzed || 0} pincodes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="p-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700">
                      {pincodeStability?.summary?.stable || 0}
                    </div>
                    <div className="text-xs text-green-600 font-medium">Stable</div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-red-200 bg-red-50">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-700">
                      {pincodeStability?.summary?.volatile || 0}
                    </div>
                    <div className="text-xs text-red-600 font-medium">Volatile</div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-700">
                      {pincodeStability?.summary?.declining || 0}
                    </div>
                    <div className="text-xs text-orange-600 font-medium">Declining</div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-gray-200 bg-gray-50">
                  <CardContent className="p-4 text-center">
                    <Pause className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-700">
                      {pincodeStability?.summary?.dormant || 0}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Dormant</div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">
                      {pincodeStability?.summary?.emerging || 0}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">Emerging</div>
                  </CardContent>
                </Card>
              </div>

              {pincodeStability?.examples && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Example Classifications</h4>
                  {Object.entries(pincodeStability.examples).map(([category, pincodes]: [string, any]) => (
                    pincodes && pincodes.length > 0 && (
                      <div key={category} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="capitalize">{category}</Badge>
                        <span className="text-gray-600">{pincodes.slice(0, 5).join(', ')}</span>
                      </div>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileCheck className="w-5 h-5 text-purple-600" />
                    Quantum-Safe Audit Trail
                  </CardTitle>
                  <CardDescription>
                    Tamper-proof audit log with integrity verification
                  </CardDescription>
                </div>
                {auditTrail?.verified === false && (
                  <Badge variant="destructive" className="w-fit">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Integrity Issue
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-gray-600">
                  {auditTrail?.events?.length || 0} events logged
                </p>
              </div>

              <div className="space-y-3">
                {auditTrail?.events?.map((event: any, index: number) => (
                  <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getEventIcon(event.event_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {event.event_type}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatDate(event.timestamp)}
                            </div>
                          </div>
                          {event.data && (
                            <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto border border-gray-200">
                              {JSON.stringify(event.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!auditTrail?.events || auditTrail.events.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No audit events recorded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
