import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  RefreshCcw,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  ArrowUpDown,
} from "lucide-react";

interface Purchase {
  id: string;
  userId: string;
  courseId: string | null;
  amount: number;
  status: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  purchasedAt: string;
}

interface Refund {
  id: string;
  purchaseId: string;
  userId: string;
  amount: number;
  reason: string | null;
  status: string;
  stripeRefundId: string | null;
  notes: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
}

interface AccountCredit {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string | null;
  relatedPurchaseId: string | null;
  relatedEnrollmentId: string | null;
  issuedBy: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminFinancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("requested_by_customer");
  const [refundNotes, setRefundNotes] = useState("");
  const [creditUserId, setCreditUserId] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditType, setCreditType] = useState("adjustment");
  const [creditDescription, setCreditDescription] = useState("");
  const [userFinancialDialogOpen, setUserFinancialDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/admin/purchases"],
    queryFn: async () => {
      const res = await fetch("/api/admin/purchases", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: refunds = [], isLoading: refundsLoading } = useQuery<Refund[]>({
    queryKey: ["/api/admin/refunds"],
    queryFn: async () => {
      const res = await fetch("/api/admin/refunds", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: credits = [], isLoading: creditsLoading } = useQuery<AccountCredit[]>({
    queryKey: ["/api/admin/credits"],
    queryFn: async () => {
      const res = await fetch("/api/admin/credits", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: userFinancial } = useQuery({
    queryKey: ["/api/admin/users", selectedUserId, "financial"],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const res = await fetch(`/api/admin/users/${selectedUserId}/financial`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedUserId,
  });

  const refundMutation = useMutation({
    mutationFn: async (data: { purchaseId: string; amount: number; reason: string; notes: string }) => {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to process refund");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Refund processed successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/refunds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases"] });
      setRefundDialogOpen(false);
      setSelectedPurchase(null);
      setRefundAmount("");
      setRefundReason("requested_by_customer");
      setRefundNotes("");
    },
    onError: (error: Error) => {
      toast({ title: "Refund failed", description: error.message, variant: "destructive" });
    },
  });

  const creditMutation = useMutation({
    mutationFn: async (data: { userId: string; amount: number; type: string; description: string }) => {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add credit");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Credit added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credits"] });
      setCreditDialogOpen(false);
      setCreditUserId("");
      setCreditAmount("");
      setCreditType("adjustment");
      setCreditDescription("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add credit", description: error.message, variant: "destructive" });
    },
  });

  const handleRefund = () => {
    if (!selectedPurchase) return;
    const parsedAmount = parseFloat(refundAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid positive amount", variant: "destructive" });
      return;
    }
    const amountCents = Math.round(parsedAmount * 100);
    if (amountCents > selectedPurchase.amount) {
      toast({ title: "Amount too high", description: "Refund amount cannot exceed the purchase amount", variant: "destructive" });
      return;
    }
    refundMutation.mutate({
      purchaseId: selectedPurchase.id,
      amount: amountCents,
      reason: refundReason,
      notes: refundNotes,
    });
  };

  const handleAddCredit = () => {
    if (!creditUserId || !creditAmount) return;
    const parsedAmount = parseFloat(creditAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid positive amount", variant: "destructive" });
      return;
    }
    creditMutation.mutate({
      userId: creditUserId,
      amount: Math.round(parsedAmount * 100),
      type: creditType,
      description: creditDescription,
    });
  };

  const openRefundDialog = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setRefundAmount((purchase.amount / 100).toFixed(2));
    setRefundDialogOpen(true);
  };

  const viewUserFinancial = (userId: string) => {
    setSelectedUserId(userId);
    setUserFinancialDialogOpen(true);
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      return user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email;
    }
    return userId.slice(0, 8) + "...";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "succeeded":
        return <Badge className="bg-green-600" data-testid={`badge-status-${status}`}><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600" data-testid={`badge-status-${status}`}><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "failed":
      case "refunded":
        return <Badge className="bg-red-600" data-testid={`badge-status-${status}`}><AlertCircle className="w-3 h-3 mr-1" />{status === "failed" ? "Failed" : "Refunded"}</Badge>;
      default:
        return <Badge data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const totalRevenue = purchases
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = refunds
    .filter((r) => r.status === "succeeded")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalCreditsIssued = credits
    .filter((c) => c.amount > 0)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-total-revenue">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-refunded">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <RefreshCcw className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalRefunded)}</p>
                <p className="text-sm text-muted-foreground">Total Refunded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-credits">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalCreditsIssued)}</p>
                <p className="text-sm text-muted-foreground">Credits Issued</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-financial"
          />
        </div>
        <Button onClick={() => setCreditDialogOpen(true)} data-testid="button-add-credit">
          <Plus className="h-4 w-4 mr-2" />
          Add Credit
        </Button>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList>
          <TabsTrigger value="purchases" data-testid="tab-purchases">
            Purchases ({purchases.length})
          </TabsTrigger>
          <TabsTrigger value="refunds" data-testid="tab-refunds">
            Refunds ({refunds.length})
          </TabsTrigger>
          <TabsTrigger value="credits" data-testid="tab-credits">
            Credits ({credits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>All payment transactions processed through Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              {purchasesLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading purchases...</p>
              ) : purchases.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No purchases yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases
                      .filter((p) => {
                        if (!searchTerm) return true;
                        const user = users.find((u) => u.id === p.userId);
                        return user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
                      })
                      .map((purchase) => (
                        <TableRow key={purchase.id} data-testid={`row-purchase-${purchase.id}`}>
                          <TableCell>{formatDate(purchase.purchasedAt)}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => viewUserFinancial(purchase.userId)}
                              className="text-blue-600 hover:underline"
                              data-testid={`link-user-${purchase.userId}`}
                            >
                              {getUserName(purchase.userId)}
                            </button>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(purchase.amount)}</TableCell>
                          <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                          <TableCell>
                            {purchase.status === "completed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRefundDialog(purchase)}
                                data-testid={`button-refund-${purchase.id}`}
                              >
                                <RefreshCcw className="h-3 w-3 mr-1" />
                                Refund
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Refund History</CardTitle>
              <CardDescription>All refunds processed</CardDescription>
            </CardHeader>
            <CardContent>
              {refundsLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading refunds...</p>
              ) : refunds.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No refunds issued</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refunds.map((refund) => (
                      <TableRow key={refund.id} data-testid={`row-refund-${refund.id}`}>
                        <TableCell>{formatDate(refund.createdAt)}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => viewUserFinancial(refund.userId)}
                            className="text-blue-600 hover:underline"
                            data-testid={`link-refund-user-${refund.userId}`}
                          >
                            {getUserName(refund.userId)}
                          </button>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">-{formatCurrency(refund.amount)}</TableCell>
                        <TableCell className="capitalize">{refund.reason?.replace(/_/g, " ") || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(refund.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Credits</CardTitle>
              <CardDescription>Manual credits issued to users</CardDescription>
            </CardHeader>
            <CardContent>
              {creditsLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading credits...</p>
              ) : credits.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No credits issued</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credits.map((credit) => (
                      <TableRow key={credit.id} data-testid={`row-credit-${credit.id}`}>
                        <TableCell>{formatDate(credit.createdAt)}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => viewUserFinancial(credit.userId)}
                            className="text-blue-600 hover:underline"
                            data-testid={`link-credit-user-${credit.userId}`}
                          >
                            {getUserName(credit.userId)}
                          </button>
                        </TableCell>
                        <TableCell className={`font-medium ${credit.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {credit.amount >= 0 ? "+" : ""}{formatCurrency(Math.abs(credit.amount))}
                        </TableCell>
                        <TableCell className="capitalize">{credit.type?.replace(/_/g, " ") || "N/A"}</TableCell>
                        <TableCell className="max-w-xs truncate">{credit.description || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Issue a refund for this purchase. This will process through Stripe if available.
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Original Purchase</p>
                <p className="font-medium">{formatCurrency(selectedPurchase.amount)}</p>
                <p className="text-sm text-muted-foreground">{formatDate(selectedPurchase.purchasedAt)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refund-amount">Refund Amount ($)</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={(selectedPurchase.amount / 100).toFixed(2)}
                  data-testid="input-refund-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refund-reason">Reason</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger data-testid="select-refund-reason">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested_by_customer">Requested by Customer</SelectItem>
                    <SelectItem value="duplicate">Duplicate Payment</SelectItem>
                    <SelectItem value="fraudulent">Fraudulent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refund-notes">Notes (optional)</Label>
                <Textarea
                  id="refund-notes"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Internal notes about this refund..."
                  data-testid="input-refund-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)} data-testid="button-cancel-refund">
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={refundMutation.isPending || !refundAmount}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-refund"
            >
              {refundMutation.isPending ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Account Credit</DialogTitle>
            <DialogDescription>
              Add credit to a user's account. Credits can be used towards future purchases.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credit-user">User</Label>
              <Select value={creditUserId} onValueChange={setCreditUserId}>
                <SelectTrigger data-testid="select-credit-user">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName} (${user.email})`
                        : user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-amount">Amount ($)</Label>
              <Input
                id="credit-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="0.00"
                data-testid="input-credit-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-type">Type</Label>
              <Select value={creditType} onValueChange={setCreditType}>
                <SelectTrigger data-testid="select-credit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="refund_credit">Refund Credit</SelectItem>
                  <SelectItem value="compensation">Compensation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit-description">Description</Label>
              <Textarea
                id="credit-description"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder="Reason for issuing this credit..."
                data-testid="input-credit-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)} data-testid="button-cancel-credit">
              Cancel
            </Button>
            <Button
              onClick={handleAddCredit}
              disabled={creditMutation.isPending || !creditUserId || !creditAmount}
              data-testid="button-confirm-credit"
            >
              {creditMutation.isPending ? "Adding..." : "Add Credit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={userFinancialDialogOpen} onOpenChange={setUserFinancialDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Financial Summary</DialogTitle>
            <DialogDescription>
              Complete financial history for {userFinancial?.user?.email || "this user"}
            </DialogDescription>
          </DialogHeader>
          {userFinancial && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(userFinancial.totalSpent)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Refunded</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(userFinancial.totalRefunded)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Credit Balance</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(userFinancial.creditBalance)}</p>
                </div>
              </div>

              {userFinancial.purchases.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Purchases ({userFinancial.purchases.length})</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {userFinancial.purchases.map((p: Purchase) => (
                      <div key={p.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{formatDate(p.purchasedAt)}</span>
                        <span className="font-medium">{formatCurrency(p.amount)}</span>
                        {getStatusBadge(p.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userFinancial.refunds.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Refunds ({userFinancial.refunds.length})</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {userFinancial.refunds.map((r: Refund) => (
                      <div key={r.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{formatDate(r.createdAt)}</span>
                        <span className="font-medium text-red-600">-{formatCurrency(r.amount)}</span>
                        {getStatusBadge(r.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userFinancial.credits.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Credits ({userFinancial.credits.length})</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {userFinancial.credits.map((c: AccountCredit) => (
                      <div key={c.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{formatDate(c.createdAt)}</span>
                        <span className={`font-medium ${c.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {c.amount >= 0 ? "+" : ""}{formatCurrency(Math.abs(c.amount))}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">{c.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setUserFinancialDialogOpen(false)} data-testid="button-close-financial">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
