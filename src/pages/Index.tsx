import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"clock_in" | "clock_out" | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    checkLastAttendanceStatus();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the attendance system",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
  };

  const checkLastAttendanceStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data: lastRecord, error } = await supabase
        .from("attendance_records")
        .select("status")
        .eq("user_id", session.user.id)
        .order("timestamp", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (lastRecord && lastRecord.length > 0) {
        setCurrentStatus(lastRecord[0].status);
      } else {
        setCurrentStatus("clock_out");
      }
    } catch (error) {
      console.error("Error checking attendance status:", error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance status",
        variant: "destructive",
      });
    }
  };

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const checkGeofence = async (lat: number, lng: number) => {
    const { data: geofence } = await supabase
      .from("geofence_settings")
      .select("*")
      .eq("is_active", true)
      .single();

    if (!geofence) return true;

    const R = 6371e3;
    const φ1 = (lat * Math.PI) / 180;
    const φ2 = (geofence.center_lat * Math.PI) / 180;
    const Δφ = ((geofence.center_lat - lat) * Math.PI) / 180;
    const Δλ = ((geofence.center_lng - lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= geofence.radius_meters;
  };

  const handleAttendance = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to record attendance",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      setIsLoading(true);

      // Get current location
      const position = await getCurrentLocation();
      const { latitude: lat, longitude: lng } = position.coords;
      setLocation({ lat, lng });

      // Check if within geofence
      const isWithinGeofence = await checkGeofence(lat, lng);
      if (!isWithinGeofence) {
        toast({
          title: "Location Error",
          description: "You are outside the allowed area",
          variant: "destructive",
        });
        return;
      }

      // Get device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        vendor: navigator.vendor,
      };

      // Record attendance
      const newStatus = currentStatus === "clock_in" ? "clock_out" : "clock_in";
      const { error } = await supabase.from("attendance_records").insert({
        user_id: session.user.id,
        status: newStatus,
        location_lat: lat,
        location_lng: lng,
        device_info: deviceInfo,
        is_within_geofence: isWithinGeofence,
      });

      if (error) throw error;

      setCurrentStatus(newStatus);
      toast({
        title: "Success",
        description: `Successfully ${newStatus === "clock_in" ? "clocked in" : "clocked out"}`,
      });
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Attendance System</h1>
            <p className="mt-2 text-sm text-gray-600">
              {currentStatus === "clock_in"
                ? "You are currently clocked in"
                : "You are currently clocked out"}
            </p>
          </div>

          {location && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </span>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleAttendance}
            disabled={isLoading}
          >
            <Clock className="mr-2 h-4 w-4" />
            {currentStatus === "clock_in" ? "Clock Out" : "Clock In"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Index;