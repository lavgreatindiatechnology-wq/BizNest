async function loadRequests() {

    if (!business) {

        $("requestList").innerHTML =
            '<div class="empty">Save business first.</div>';

        return;
    }


    const { data, error } =
        await sb
            .from("requests")
            .select("*")
            .eq("business_id", business.id)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        $("requestList").innerHTML =
            "<p>❌ " + error.message + "</p>";

        return;
    }


    if (!data || data.length === 0) {

        $("requestList").innerHTML =
            '<div class="empty">No orders or bookings yet.</div>';

        return;
    }


    $("requestList").innerHTML =
        data.map(request => `

        <div class="card request-card">

            <div class="request-header">

                <div>

                    <h3>
                        ${
                            request.type === "order"
                                ? "🛒 Product Order"
                                : request.type === "booking"
                                ? "📅 Service Booking"
                                : "📩 Customer Request"
                        }
                    </h3>

                    <p>
                        <b>${esc(request.item_name || "General Request")}</b>
                    </p>

                </div>

                <div class="status-badge status-${request.status}">
                    ${esc(request.status || "pending")}
                </div>

            </div>


            <hr>


            <p>
                👤 <b>Customer:</b>
                ${esc(request.customer_name || "Customer")}
            </p>

            <p>
                📞 <b>Phone:</b>
                ${esc(request.customer_phone || "-")}
            </p>

            <p>
                💬 <b>Message:</b>
                ${esc(request.note || "-")}
            </p>


            <div class="action-buttons">

                <button
                    class="btn orange"
                    onclick="updateRequestStatus('${request.id}', 'accepted')"
                >
                    ✅ Accept
                </button>


                <button
                    class="btn danger"
                    onclick="updateRequestStatus('${request.id}', 'rejected')"
                >
                    ❌ Reject
                </button>


                <button
                    class="btn"
                    onclick="updateRequestStatus('${request.id}', 'processing')"
                >
                    📦 Processing
                </button>


                <button
                    class="btn"
                    onclick="updateRequestStatus('${request.id}', 'out_for_delivery')"
                >
                    🚚 Out for Delivery
                </button>


                <button
                    class="btn"
                    onclick="updateRequestStatus('${request.id}', 'delivered')"
                >
                    ✅ Delivered / Completed
                </button>

            </div>


        </div>

        `).join("");
}
