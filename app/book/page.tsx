import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/toaster"
import { Booking } from "@/components/booking"

export default function BookAccountPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Tvättstuga</h3>
                <p className="text-sm text-muted-foreground">
                    Boka tid i tvättstugan.
                </p>
            </div>
            <Separator />
            <Booking />
            <Toaster />
        </div>
    )
}
