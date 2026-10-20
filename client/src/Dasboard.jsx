
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://localhost:3000/api";

function Dashboard() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("Saving");
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [action, setAction] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipientAccountId, setRecipientAccountId] = useState("");
  const [transactionLoading, setTransactionLoading] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Fetch the logged-in user's account.
  const fetchAccount = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return null;
    }

    const response = await fetch(`${API_URL}/account/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      navigate("/");
      return null;
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        typeof data === "string"
          ? data
          : data.message || "Failed to fetch account"
      );
    }

    return data.account;
  }, [navigate]);

  // Load account on page open.
  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const result = await fetchAccount();

        if (active) {
          setAccount(result);
          setErr("");
        }
      } catch (error) {
        if (active) {
          setErr(error.message || "Unable to load account");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, [fetchAccount]);

  // Create a bank account.
  async function handleCreateAccount(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    setCreating(true);
    setErr("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ account: accountType }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Account creation failed");
      }

      setAccount(data.account);
      setSuccess("Account created successfully.");
    } catch (error) {
      setErr(error.message || "Unable to create account");
    } finally {
      setCreating(false);
    }
  }

  // Fetch transaction history for this account.
  const fetchTransactionHistory = useCallback(async (accountId) => {
    const token = localStorage.getItem("token");

    if (!token || !accountId) return;

    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch(
        `${API_URL}/history/${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data.message || "Failed to load transaction history"
        );
      }

      const list = Array.isArray(data)
        ? data
        : data.transactions ?? data.history ?? [];

      if (!Array.isArray(list)) {
        throw new Error("Invalid transaction history response");
      }

      setTransactions(list);
    } catch (error) {
      setHistoryError(
        error.message || "Unable to load transaction history"
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [navigate]);

  // Load history whenever the account becomes available.
  useEffect(() => {
    if (account?._id) {
      fetchTransactionHistory(account._id);
    } else {
      setTransactions([]);
    }
  }, [account?._id, fetchTransactionHistory]);

  // Deposit, withdrawal, and transfer.
  async function handleTransaction(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setErr("Enter an amount greater than zero.");
      return;
    }

    if (!account?._id) {
      setErr("Your account could not be found.");
      return;
    }

    if (
      action === "WITHDRAWAL" &&
      numericAmount > Number(account.balance)
    ) {
      setErr("Insufficient balance.");
      return;
    }

    if (action === "TRANSFER" && !recipientAccountId.trim()) {
      setErr("Enter the recipient's account ID.");
      return;
    }

    setTransactionLoading(true);
    setErr("");
    setSuccess("");

    try {
      const isTransfer = action === "TRANSFER";

      const endpoint = isTransfer
        ? `${API_URL}/transaction/moneyTransfer`
        : `${API_URL}/transaction`;

      const body = isTransfer
        ? {
            formaccountId: account._id,
            toaccountId: recipientAccountId.trim(),
            amount: numericAmount,
            type: "TRANSFER",
            description: description.trim(),
          }
        : {
            accountId: account._id,
            amount: numericAmount,
            type: action,
            description: description.trim(),
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data.message || "Transaction failed"
        );
      }

      // Refresh the balance and transaction history.
      const updatedAccount = await fetchAccount();

      if (updatedAccount) {
        setAccount(updatedAccount);
        await fetchTransactionHistory(updatedAccount._id);
      }

      setAmount("");
      setDescription("");
      setRecipientAccountId("");
      setAction("");
      setSuccess(
        typeof data === "object" && data.message
          ? data.message
          : "Transaction completed successfully."
      );
    } catch (error) {
      setErr(error.message || "Unable to complete transaction");
    } finally {
      setTransactionLoading(false);
    }
  }

  function openAction(type) {
    setAction(type);
    setAmount("");
    setDescription("");
    setRecipientAccountId("");
    setErr("");
    setSuccess("");
    scrollToSection("transaction-form");
  }

  const formattedBalance = account
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: account.currency || "INR",
      }).format(account.balance ?? 0)
    : "Unavailable";

  function formatAmount(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: account?.currency || "INR",
    }).format(Number(value) || 0);
  }

  function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Date unavailable"
      : date.toLocaleString("en-IN");
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="brand">MyBank</h2>

        <nav className="sidebar-nav">
          <button
            type="button"
            className="nav-item active"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span>▦</span> Dashboard
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={() => scrollToSection("transactions")}
          >
            <span>↕</span> Transactions
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={() => scrollToSection("quick-actions")}
          >
            <span>⇄</span> Quick Actions
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={() => {
              setErr("");
              setSuccess("");

              if (account) {
                setSuccess("You already have an account.");
                scrollToSection("account-details");
              } else {
                scrollToSection("create-account");
              }
            }}
          >
            <span>＋</span> Create Account
          </button>
        </nav>

        <button
          type="button"
          className="nav-item logout"
          onClick={handleLogout}
        >
          <span>↪</span> Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome to your personal banking dashboard.</p>
          </div>

          <button
            type="button"
            className="profile-button"
            onClick={() =>
              scrollToSection(
                account ? "account-details" : "create-account"
              )
            }
          >
            My Account
          </button>
        </header>

        {loading && <p role="status">Loading account...</p>}

        {!loading && !account && (
          <section
            className="transactions-card"
            id="create-account"
          >
            <h2>Create Your Bank Account</h2>
            <p>Choose an account type to get started.</p>

            <form
              onSubmit={handleCreateAccount}
              className="create-account-form"
            >
              <label htmlFor="accountType">Account Type</label>

              <select
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                required
              >
                <option value="Saving">Savings Account</option>
                <option value="Current">Current Account</option>
                <option value="Bussiness">Business Account</option>
              </select>

              <button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Account"}
              </button>
            </form>
          </section>
        )}

        {err && (
          <p role="alert" className="dashboard-error">
            {err}
          </p>
        )}

        {success && (
          <p role="status" className="dashboard-success">
            {success}
          </p>
        )}

        {account && (
          <>
            <section
              className="balance-card"
              id="account-details"
            >
              <p>Total Account Balance</p>
              <h2>{formattedBalance}</h2>
              <span>
                Account type: {account.account} · Status:{" "}
                {account.status}
              </span>
            </section>

            <section
              className="dashboard-section"
              id="quick-actions"
            >
              <h2>Quick Actions</h2>

              <div className="action-grid">
                <button
                  type="button"
                  className="action-card"
                  onClick={() => openAction("DEPOSIT")}
                >
                  <span className="action-icon deposit">↓</span>
                  <strong>Deposit</strong>
                  <small>Add money to your account</small>
                </button>

                <button
                  type="button"
                  className="action-card"
                  onClick={() => openAction("WITHDRAWAL")}
                >
                  <span className="action-icon withdraw">↑</span>
                  <strong>Withdraw</strong>
                  <small>Withdraw money</small>
                </button>

                <button
                  type="button"
                  className="action-card"
                  onClick={() => openAction("TRANSFER")}
                >
                  <span className="action-icon transfer">⇄</span>
                  <strong>Transfer</strong>
                  <small>Send money to another account</small>
                </button>
              </div>
            </section>

            {action && (
              <section
                className="transactions-card"
                id="transaction-form"
              >
                <h2>
                  {action === "DEPOSIT"
                    ? "Deposit Money"
                    : action === "WITHDRAWAL"
                    ? "Withdraw Money"
                    : "Transfer Money"}
                </h2>

                <form
                  onSubmit={handleTransaction}
                  className="create-account-form"
                >
                  {action === "TRANSFER" && (
                    <>
                      <label htmlFor="recipientAccountId">
                        Recipient Account ID
                      </label>

                      <input
                        id="recipientAccountId"
                        type="text"
                        value={recipientAccountId}
                        onChange={(e) =>
                          setRecipientAccountId(e.target.value)
                        }
                        placeholder="Enter recipient account ID"
                        required
                      />
                    </>
                  )}

                  <label htmlFor="transactionAmount">
                    Amount (₹)
                  </label>

                  <input
                    id="transactionAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />

                  <label htmlFor="transactionDescription">
                    Description (optional)
                  </label>

                  <input
                    id="transactionDescription"
                    type="text"
                    maxLength={200}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                  />

                  <button
                    type="submit"
                    disabled={transactionLoading}
                  >
                    {transactionLoading
                      ? "Processing..."
                      : action === "DEPOSIT"
                      ? "Deposit Money"
                      : action === "WITHDRAWAL"
                      ? "Withdraw Money"
                      : "Transfer Money"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAction("");
                      setErr("");
                      setSuccess("");
                    }}
                    disabled={transactionLoading}
                  >
                    Cancel
                  </button>
                </form>
              </section>
            )}

            <section
              className="transactions-card"
              id="transactions"
            >
              <div className="history-header">
                <div>
                  <h2>Recent Transactions</h2>
                  <p>Review your account activity.</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fetchTransactionHistory(account._id)
                  }
                  disabled={historyLoading}
                >
                  {historyLoading ? "Loading..." : "Refresh"}
                </button>
              </div>

              {historyLoading && (
                <p role="status">Loading transactions...</p>
              )}

              {historyError && (
                <p role="alert" className="dashboard-error">
                  {historyError}
                </p>
              )}

              {!historyLoading &&
                !historyError &&
                transactions.length === 0 && (
                  <p className="empty-message">
                    No transactions found.
                  </p>
                )}

              {!historyLoading && transactions.length > 0 && (
                <div className="transaction-list">
                  {transactions.map((transaction) => {
                    const type = transaction.type || "TRANSACTION";
                    const isCredit = type === "DEPOSIT";
                    const isTransfer = type === "TRANSFER";

                    return (
                      <div
                        className="transaction-item"
                        key={transaction._id}
                      >
                        <div className="transaction-info">
                          <span
                            className={`transaction-icon ${
                              isCredit ? "credit" : "debit"
                            }`}
                          >
                            {isCredit ? "↓" : isTransfer ? "⇄" : "↑"}
                          </span>

                          <div>
                            <strong>
                              {type === "DEPOSIT"
                                ? "Deposit"
                                : type === "WITHDRAWAL"
                                ? "Withdrawal"
                                : type === "TRANSFER"
                                ? "Transfer"
                                : type}
                            </strong>

                            <p>
                              {transaction.description ||
                                "No description"}
                            </p>

                            <small>
                              {formatDate(
                                transaction.createdAt ||
                                  transaction.created_at
                              )}
                            </small>
                          </div>
                        </div>

                        <div className="transaction-amount">
                          <strong
                            className={isCredit ? "credit-text" : ""}
                          >
                            {isCredit ? "+" : "-"}
                            {formatAmount(transaction.amount)}
                          </strong>

                          <span
                            className={`transaction-status ${
                              transaction.status === "COMPLETED"
                                ? "status-completed"
                                : transaction.status === "FAILED"
                                ? "status-failed"
                                : "status-pending"
                            }`}
                          >
                            {transaction.status || "UNKNOWN"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
