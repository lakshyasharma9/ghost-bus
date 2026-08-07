import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Eye, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supportAPI } from "@/lib/api-client";
import { format } from "date-fns";

export const Route = createFileRoute("/account/support")({
  head: () => ({
    meta: [{ title: "My Support Tickets — GhostBus" }],
  }),
  component: UserSupportPage,
});

function UserSupportPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["user-support-tickets"],
    queryFn: () => supportAPI.getTickets({}),
  });

  const tickets = data?.data?.data?.tickets || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800";
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "CLOSED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW": return "bg-gray-100 text-gray-800";
      case "MEDIUM": return "bg-blue-100 text-blue-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "URGENT": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN": return <Clock className="w-4 h-4" />;
      case "IN_PROGRESS": return <Clock className="w-4 h-4" />;
      case "RESOLVED": return <CheckCircle2 className="w-4 h-4" />;
      case "CLOSED": return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Support Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">View and track your support requests</p>
        </div>
        <Link to="/contact">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-accent grid place-items-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Support Tickets</h3>
            <p className="text-sm text-muted-foreground mb-6">You haven't created any support tickets yet.</p>
            <Link to="/contact">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Ticket
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket: any) => (
            <Card key={ticket.id} className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                      <Badge variant="secondary" className={getStatusColor(ticket.status)}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status.replace("_", " ")}</span>
                      </Badge>
                      <Badge variant="secondary" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Category: {ticket.category.replace(/_/g, " ")}</span>
                      <span>•</span>
                      <span>Created: {format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                      {ticket.resolvedAt && (
                        <>
                          <span>•</span>
                          <span>Resolved: {format(new Date(ticket.resolvedAt), "MMM d, yyyy")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{ticket.message}</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
