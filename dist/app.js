"use strict";


(function(a) {
    function b(d) {
        if (c[d]) return c[d].exports;
        var e = c[d] = {
            exports: {},
            id: d,
            loaded: !1
        };
        return a[d].call(e.exports, e, e.exports, b), e.loaded = !0, e.exports
    }
    var c = {};
    return b.m = a, b.c = c, b.p = "", b(0)
})([function() {
    function a() {
        r.querySelectorAll(".bk-form-group.bk-required:not(.ready)").length ? (J.disabled = !0, K.classList.add("in")) : (J.disabled = !1, K.classList.remove("in"))
    }

    function b() {
        P.setDate(1), Q.setDate(1), Q.setMonth(Q.getMonth() + 1), c(), e().then(function(a) {
            var b = a.settings,
                c = a.bookings.filter(function(a) {
                    return a.parent == u.getAttribute("data-cal")
                });
            u.setAttribute("data-t0", b.time_start0 + " - " + b.time_end0), u.setAttribute("data-t1", b.time_start1 + " - " + b.time_end1), u.setAttribute("data-t2", b.time_start2 + " - " + b.time_end2), q().then(function(a) {
                S = a, h(c), f(c)
            })
        }).catch(function(a) {
        }), F.addEventListener("submit", function() {
            J.disabled = !0, J.classList.add("processing"), J.value = "Processing.."
        }), H.querySelector("select").addEventListener("change", function() {
            H.classList.add("ready"), H.classList.remove("bk-status-is"), a()
        }), Array.prototype.forEach.call(I, function(b) {
            var c = b.querySelectorAll("input:not([type=\"file\"]):not([type=\"email\"]):not([type=\"tel\"])"),
                d = b.querySelectorAll("input[type=\"file\"]"),
                e = b.querySelectorAll("textarea"),
                f = b.querySelectorAll("input[type=\"email\"]"),
                g = b.querySelectorAll("input[type=\"tel\"]");
            Array.prototype.forEach.call(c, function(c) {
                c.addEventListener("keyup", function() {
                    "" == c.value ? (b.classList.remove("ready"), b.classList.add("bk-status-is"), a()) : (b.classList.add("ready"), b.classList.remove("bk-status-is"), a())
                });
                c.addEventListener("paste", function() {
                    setTimeout(function () {
                        "" == c.value ?
                            (b.classList.remove("ready"), b.classList.add("bk-status-is"), a()) :
                            (b.classList.add("ready"), b.classList.remove("bk-status-is"), a())
                    },10);
                });
            }), Array.prototype.forEach.call(e, function(c) {
                c.addEventListener("keyup", function() {
                    "" == c.value ? (b.classList.remove("ready"), b.classList.add("bk-status-is"), a()) : (b.classList.add("ready"), b.classList.remove("bk-status-is"), a())
                });
                c.addEventListener("paste", function() {
                    setTimeout(function () {
                        "" == c.value ? (b.classList.remove("ready"), b.classList.add("bk-status-is"), a()) : (b.classList.add("ready"), b.classList.remove("bk-status-is"), a())
                    },10);
                });
            }), Array.prototype.forEach.call(f, function(c) {
                c.addEventListener("keyup", function() {
                    "" == c.value ? (b.classList.remove("ready"), b.classList.add("bk-status-is"), a()) : s.test(c.value) ? (b.classList.add("ready"), b.classList.remove("bk-status-is"), a()) : (b.classList.remove("ready"), b.classList.add("bk-status-is"), a())
                });
                c.addEventListener("paste", function() {
                    setTimeout(function () {
                        "" == c.value ? (b.classList.remove("ready"), b.classList.add("bk-status-is"), a()) : s.test(c.value) ? (b.classList.add("ready"), b.classList.remove("bk-status-is"), a()) : (b.classList.remove("ready"), b.classList.add("bk-status-is"), a())
                    },10);
                });
            }), Array.prototype.forEach.call(g, function(c) {
                c.addEventListener("keyup", function() {
                    c.value = c.value.replace(/[^0-9\.]/g, ""), "" == c.value ? (b.classList.remove("ready"), b.classList.add("bk-status-is"), a()) : !isNaN(parseFloat(c.value)) && isFinite(c.value) && 5 < c.value.length ? (b.classList.add("ready"), b.classList.remove("bk-status-is"), a()) : (b.classList.remove("ready"), b.classList.add("bk-status-is"), a())
                });
                c.addEventListener("paste", function() {
                    setTimeout(function () {
                        c.value = c.value.replace(/[^0-9\.]/g, ""), "" == c.value ? (b.classList.remove("ready"), b.classList.add("bk-status-is"), a()) : !isNaN(parseFloat(c.value)) && isFinite(c.value) && 5 < c.value.length ? (b.classList.add("ready"), b.classList.remove("bk-status-is"), a()) : (b.classList.remove("ready"), b.classList.add("bk-status-is"), a())
                    },10);
                });
            })
        })
    }

    function c() {
        -1 < window.location.href.indexOf("med_status") && window.history.replaceState("", document.title, window.location.href.replace(window.location.search, ""))
    }

    function e() {
        return new Promise(function(a, b) {
            var c = {
                    action: "call",
                    security: Ajax.security,
                    type: "calendar",
                    id: u.getAttribute("data-cal"),
                    admin: !1
                },
                e = new FormData;
            for (var f in c) e.append(f, c[f]);
            fetch(Ajax.ajaxurl, {
                method: "POST",
                credentials: "same-origin",
                body: e
            }).then(function(a) {
                return a.json()
            }).then(function(f) {
                for (var g in d.settings = f, c.type = "bookings", e = new FormData, c) e.append(g, c[g]);
                fetch(Ajax.ajaxurl, {
                    method: "POST",
                    credentials: "same-origin",
                    body: e
                }).then(function(a) {
                    return a.json()
                }).then(function(b) {
                    d.bookings = b, a(d)
                }).catch(function(a) {
                    b(a)
                })
            }).catch(function(a) {
                b(a)
            })
        })
    }

    function f(a) {
        y.addEventListener("click", function() {
            if (!y.classList.contains("busy")) {
                y.classList.add("busy"), o();
                var b = P.getMonth() + 1,
                    c = Q.getMonth() + 1;
                P.setMonth(b), Q.setMonth(c), h(a), A.classList.remove("bk-hidden"), u.classList.remove("popup-open"), setTimeout(function() {
                    y.classList.remove("busy")
                }, 500)
            }
        }), z.addEventListener("click", function() {
            if (!z.classList.contains("busy")) {
                z.classList.add("busy"), o();
                var b = P.getMonth() + 1,
                    c = Q.getMonth() + 1;
                P.setMonth(b), Q.setMonth(c), h(a), A.classList.remove("bk-hidden"), u.classList.remove("popup-open"), setTimeout(function() {
                    z.classList.remove("busy")
                }, 500)
            }
        }), A.addEventListener("click", function() {
            A.classList.contains("busy") || (A.classList.add("busy"), o(), P.setMonth(P.getMonth() - 1), Q.setMonth(Q.getMonth() - 1), h(a), P.getMonth() == R.getMonth() && P.getFullYear() == R.getFullYear() && A.classList.add("bk-hidden"), u.classList.remove("popup-open"), setTimeout(function() {
                A.classList.remove("busy")
            }, 500))
        })
    }

    function g(a, b, c, d, e, f) {
        P.setHours(0, 0, 0, 0), R.setHours(0, 0, 0, 0);
        var g = "first" == d ? P : Q,
            h = r.createElement("div"),
            i = r.createElement("span"),
            j = ("0" + g.getDate()).slice(-2) + "." + ("0" + (P.getMonth() + 1)).slice(-2) + "." + P.getFullYear();

        if (i.innerHTML = a, i.className = "bk-date-span", h.className = "bk-date", h.setAttribute("data-calendar-date", j), h.setAttribute("data-icon", !1), 1 === a && (5 == b && 31 === e || 6 == b && 30 === e || 0 == b && 29 === e ? f.setAttribute("data-date-touches", "true") : f.setAttribute("data-date-touches", "false")), T = S.find(function(a) {
                return a == j
            }), T) {
            var k = !1;

            var elList = r.querySelectorAll(".bk-legend-item");
            Array.prototype.forEach.call(elList, function(a) {
                a.hasAttribute("data-icon") && (k = !0)
            }), k && (h.setAttribute("data-icon", !0), h.classList.add("holiday"), h.innerHTML = "<div class=\"bk-lg-icon\"><i class=\"".concat(r.querySelector(".bk-legend-withicon").getAttribute("data-icon"), "\"></i></div>"));
            // r.querySelectorAll(".bk-legend-item").forEach(function(a) {
            //     a.hasAttribute("data-icon") && (k = !0)
            // }), k && (h.setAttribute("data-icon", !0), h.classList.add("holiday"), h.innerHTML = "<div class=\"bk-lg-icon\"><i class=\"".concat(r.querySelector(".bk-legend-withicon").getAttribute("data-icon"), "\"></i></div>"))
        }
        1 === a && (6 === b ? "first" == d ? h.style.marginLeft = "calc(85.67999999999999% - 1px)" : h.style.marginLeft = "85.67999999999999%" : "first" == d ? h.style.marginLeft = "calc(" + 14.28 * b + "% - 1px)" : h.style.marginLeft = 14.28 * b + "%"), 1 == a && (y.classList.remove("bk-hidden"), z.classList.remove("bk-hidden")), P.getTime() < R.getTime() ? h.classList.add("bk-date--disabled") : 0 == b || 6 == b ? h.classList.add("bk-date--disabled") : (h.classList.add("bk-date--active"), h.setAttribute("data-calendar-status", "active"), P.getTime() == R.getTime() && h.classList.add("bk-date--today"), function(a, b) {
            var c;
            return c = 12 * (b.getFullYear() - a.getFullYear()), c -= a.getMonth() + 1, c += b.getMonth(), c == u.getAttribute("data-monthrange")
        }(R, new Date(P.getFullYear(), P.getMonth(), P.getDate())) && (a > R.getDate() && (h.classList.add("bk-date--disabled"), h.classList.remove("bk-date--active"), h.removeAttribute("data-calendar-status")), y.classList.add("bk-hidden"), z.classList.add("bk-hidden")), function(a, b) {
            var c;
            return c = 12 * (b.getFullYear() - a.getFullYear()), c -= a.getMonth() + 1, c += b.getMonth(), !(c <= u.getAttribute("data-monthrange"))
        }(R, new Date(P.getFullYear(), P.getMonth(), P.getDate())) && (h.classList.add("bk-date--disabled"), h.classList.remove("bk-date--active"), h.removeAttribute("data-calendar-status"))), h.appendChild(i), "first" == d ? w.appendChild(h) : x.appendChild(h)
    }

    function h(a) {
        for (var b = P.getMonth(), c = Q.getMonth(), d = 32 - new Date(P.getFullYear(), b, 32).getDate(), e = 32 - new Date(P.getFullYear(), c, 32).getDate(), f = r.querySelectorAll(".bk-body")[0], h = r.querySelectorAll(".bk-body")[1]; P.getMonth() === b;) g(P.getDate(), P.getDay(), P.getFullYear(), "first", d, f), P.setDate(P.getDate() + 1);
        for (; Q.getMonth() === c;) g(Q.getDate(), Q.getDay(), Q.getFullYear(), null, e, h), Q.setDate(Q.getDate() + 1);
        P.setDate(1), P.setMonth(P.getMonth() - 1), Q.setDate(1), Q.setMonth(Q.getMonth() - 1), B.innerHTML = n(P.getMonth()) + " " + P.getFullYear(), C.innerHTML = n(Q.getMonth()) + " " + Q.getFullYear();
        var k = 9 > P.getMonth() ? "0" + (P.getMonth() + 1) : P.getMonth() + 1,
            l = 9 > Q.getMonth() ? "0" + (Q.getMonth() + 1) : Q.getMonth() + 1,
            m = k + "." + P.getFullYear(),
            o = l + "." + Q.getFullYear();
        a = a.filter(function(a) {
            if (a.date.includes(m) || a.date.includes(o)) return a
        }), a = a.filter(function(a, b, c) {
            return c.map(function(a) {
                return a.date
            }).indexOf(a.date) === b ? ("full" == c[b].type && (c[b].full = !0), a) : void c.forEach(function(a) {
                a.date == c[b].date && a.type != c[b].type && (a.full = !0, ("pending" == c[b].status || "pending" == a.status) && (c[b].status = "pending", a.status = "pending"))
            })
        }), i(a), j()
    }

    function i(a) {
        Object.keys(a).some(function(b) {
            var c = a[b].date,
                d = a[b].type,
                e = a[b].status,
                f = a[b].full,
                g = r.querySelector(".bk-date[data-calendar-date=\"".concat(c, "\"]"));
            "first" == d || "last" == d ? f ? (g.classList.add("bk-date--booked"), g.classList.add("bk-date--disabled")) : (g.classList.add("bk-date--half"), g.setAttribute("data-slot", a[b].type), g.setAttribute("data-location", a[b].location), g.insertAdjacentHTML("beforeend", "<div class=\"bk-half\"><div class=\"bk-rotate\"><div class=\"bk-half-block bk-half-first\"></div><div class=\"bk-half-block bk-half-last\"></div></div></div>")) : (g.classList.add("bk-date--booked"), g.classList.add("bk-date--disabled")), "pending" == e && g.classList.add("bk-date-pending")
        });
        t.classList.remove("bk-loading")
    }

    function j() {
        O = r.querySelectorAll("[data-calendar-status=\"active\"]");
        for (var a = function(a) {
                O[a].addEventListener("click", function(b) {
                    if (!b.target.matches(".bk-popup,.time-label,.bk-timeslot input,.bk-timeslot-info,.bk-timeslot-info h1,.bk-timeslot-action") && !b.target.classList.contains("bk-popup")) {
                        var c = O[a].dataset.calendarDate;
                        p(), O[a].classList.contains("haspop") ? !O[a].classList.contains("bk-date--booked") && (O[a].classList.remove("haspop"), O[a].removeChild(O[a].querySelector(".bk-popup"))) : (O[a].classList.add("bk-date--selected"), u.classList.add("popup-open"), m(O[a], c))
                    }
                });
                O[a].addEventListener("mouseenter", function(b) {
                    if (!b.target.matches("div.bk-date.holiday.bk-date--active") && !b.target.matches("div.bk-date.bk-date--active.bk-date--booked.bk-date--disabled") && !b.target.matches("div.bk-date.bk-date--active.bk-date--half.bk-date-pending") && !b.target.matches("div.bk-date.bk-date--active.bk-date--half")){
                        O[a].classList.add("bk-date--selected");
                    }
                });
                O[a].addEventListener("mouseleave", function(b) {
                    if (!b.target.matches("div.bk-date.holiday.bk-date--active") && !b.target.matches("div.bk-date.bk-date--active.bk-date--booked.bk-date--disabled") && !b.target.matches("div.bk-date.bk-date--active.bk-date--half.bk-date-pending") && !b.target.matches("div.bk-date.bk-date--active.bk-date--half")){
                        O[a].classList.remove("bk-date--selected");
                    }
                });
            // start code here for date
            O[a].addEventListener("click", function(b) {
                if(O[a].getAttribute("data-slot") === "first"){
                    selectedDate();
                }
                if(b.srcElement.className === 'bk-date bk-date--active bk-date--selected haspop'
                    || b.srcElement.className === 'bk-date bk-date--active bk-date--half bk-date--selected haspop'
                    || b.srcElement.className === 'bk-date bk-date--active bk-date--half'
                    || b.srcElement.className === 'bk-half-block bk-half-last'
                    || b.srcElement.className === 'bk-date bk-date--active bk-date--today bk-date--selected haspop'
                    || b.srcElement.className === 'bk-half-block bk-half-first'
                ){
                    selectedDate();
                }

                if(b.srcElement.className === 'bk-date-span'){
                    if(b.srcElement.offsetParent.className === 'bk-date bk-date--active bk-date--selected haspop'
                        || b.srcElement.offsetParent.className === 'bk-date bk-date--active bk-date--half bk-date--selected haspop'
                        || b.srcElement.offsetParent.className === "bk-date bk-date--active bk-date--today bk-date--selected haspop"
                        || b.srcElement.offsetParent.className === 'bk-date bk-date--active bk-date--today bk-date--half bk-date--selected haspop'
                        || b.srcElement.offsetParent.className === 'bk-cal bk-cal-prev'
                    ){
                        selectedDate();
                    }
                }

                if(b.srcElement.className === 'bk-date holiday bk-date--active bk-date--selected haspop' || b.srcElement.className === 'bk-date holiday bk-date--active bk-date--half bk-date--selected haspop'){
                    selectedDate();
                }

                if(b.srcElement.tagName === 'I'){
                    if(b.srcElement.offsetParent.className === 'bk-date holiday bk-date--active bk-date--selected haspop'
                        || b.srcElement.offsetParent.className === 'bk-date holiday bk-date--active bk-date--half bk-date--selected haspop'
                        || b.srcElement.offsetParent.className === 'bk-date bk-date--active bk-date--today bk-date--selected haspop'
                    ){
                        selectedDate();
                    }
                }

            });
            // end code here for date
            }, b = 0; b < O.length; b++) a(b);
        r.addEventListener("click", function(a) {
            if (!a.target.matches(".bk-date,.bk-date-span,.bk-half,.bk-rotate,.bk-half-block,.bk-popup,.time-label,.bk-timeslot input,.bk-timeslot-info,.bk-timeslot-info h1,.bk-timeslot-action,.bk-btn,.bk-btn svg,.bk-btn path,.bk-header__label,.bk-header,.bk-lg-icon,.bk-lg-icon i") && u.classList.contains("popup-open")) {
                var b = r.querySelector(".bk-date.haspop");
                p(), b.classList.remove("haspop"), b.removeChild(b.querySelector(".bk-popup"))
            }
            if (a.target.matches(".time-label"), a.target.matches(".bk-timeslot,.time-label,.time-checkbox,input[name=\"booking-time\"]") && r.querySelector(".bk-timeslot input:checked")) {
                var month = new Array();
                month[1] = "January";
                month[2] = "February";
                month[3] = "March";
                month[4] = "April";
                month[5] = "May";
                month[6] = "June";
                month[7] = "July";
                month[8] = "August";
                month[9] = "September";
                month[10] = "October";
                month[11] = "November";
                month[12] = "December";
                var c = r.querySelector(".chosen-date"),
                    d = r.querySelector(".chosen-time"),
                    e = r.querySelector(".bk-timeslot input:checked"),
                    f = r.querySelector(".bk-timeslot input:checked").value,
                    g = document.querySelector(".bk-date--selected").getAttribute("data-calendar-date"),
                    h = !1,
                    i = [{
                        n: "Full day: " + u.getAttribute("data-t0"),
                        v: "full",
                        d: !1,
                        a: !1
                    }, {
                        n: "Half day: " + u.getAttribute("data-t1"),
                        v: "first",
                        d: !1,
                        a: !1
                    }, {
                        n: "Half day: " + u.getAttribute("data-t2"),
                        v: "last",
                        d: !1,
                        a: !1
                    }];
                e.parentNode.classList.contains("bk-half-booked") && (i[0].d = !0, i[1].d = !0, i[2].d = !0, "first" == f ? i[1].d = !1 : "last" == f && (i[2].d = !1)), "full" == f ? (f = "Full day: " + u.getAttribute("data-t0"), i[0].a = !0) : "first" == f ? (f = "Half day: " + u.getAttribute("data-t1"), i[1].a = !0) : "last" == f && (f = "Half day: " + u.getAttribute("data-t2"), i[2].a = !0), "null" == r.querySelector(".bk-date.haspop").getAttribute("data-location") && (h = !0);
                var j = g.split(".");
                if (
                    j = month[parseInt(j[1])]+" "+j[0]+", "+ j[2]
                    , c.innerHTML = "Date booked: <span>" + j + "</span>", d.innerHTML = "Time booked: <span>" + f + "</span>", N.value = g,
                     Array.prototype.forEach.call(E.querySelectorAll("option"),function(a, b) {
                        0 < b && (a.disabled = !1)
                    }), r.querySelector(".bk-date.haspop").classList.contains("bk-date--half")) {
                    var m = r.querySelector(".bk-date.haspop").getAttribute("data-location");
                    l(m, h)
                }
                r.querySelector(".bk-date--selected").classList.remove("haspop"), r.querySelector(".bk-date--selected").removeChild(r.querySelector(".bk-popup")), u.classList.remove("popup-open"), k(i)
            }
        })
    }

    function selectedDate(){
        var month = new Array();
        month[1] = "January";
        month[2] = "February";
        month[3] = "March";
        month[4] = "April";
        month[5] = "May";
        month[6] = "June";
        month[7] = "July";
        month[8] = "August";
        month[9] = "September";
        month[10] = "October";
        month[11] = "November";
        month[12] = "December";
        var c = r.querySelector(".chosen-date"),
            g = document.querySelector(".bk-date--selected").getAttribute("data-calendar-date"),
            h = !1,
            j = g.split(".");
        if (
            j = month[parseInt(j[1])]+" "+j[0]+", "+ j[2]
            , c.innerHTML = "Date booked: <span>" + j + "</span>", N.value = g,
            Array.prototype.forEach.call(E.querySelectorAll("option"), function (a, b) {
                0 < b && (a.disabled = !1)
            }), r.querySelector(".bk-date.haspop").classList.contains("bk-date--half")) {
            var m = r.querySelector(".bk-date.haspop").getAttribute("data-location");
            l(m, h)
        }
    }

    function k(b) {
        G.classList.add("ready"), G.classList.remove("bk-status-is"), a(), D.innerHTML = "", b.forEach(function(b) {
            var c = !0 == b.d ? "disabled" : "",
                d = !0 == b.a ? "selected" : "";
            D.insertAdjacentHTML("beforeend", "<option value=\"".concat(b.v, "\" ").concat(c, " ").concat(d, ">").concat(b.n, "</option>"))
        })
    }

    function l(a, b) {
        b ? Array.prototype.forEach.call(E.querySelectorAll("option"),function(a) {
            a.disabled = !1
        }) : Array.prototype.forEach.call(E.querySelectorAll("option"), function(b) {
            b.disabled = b.value != a
        })
    }

    function m(a, b) {
        b.replace(/\./g, ",");
        Array.prototype.forEach.call(v, function(a) {
            var b = a.querySelectorAll(".bk-date.haspop"),
                c = a.querySelectorAll(".bk-date");
        Array.prototype.forEach.call(b, function(a) {
                a.removeChild(a.querySelector(".bk-popup"))
            }), Array.prototype.forEach.call(c, function(a) {
                return a.classList.remove("haspop")
            })
        }), a.classList.add("haspop");
        var c = a.classList.contains("bk-date--booked") ? "bk-popfull" : "";
        if (a.insertAdjacentHTML("beforeend", "<div class=\"bk-popup bk-hidden ".concat(c, "\"></div>")), a.classList.contains("bk-date--half")) {
            var d = "first" == a.getAttribute("data-slot") ? u.getAttribute("data-t2") : u.getAttribute("data-t1"),
                e = "first" == a.getAttribute("data-slot") ? "last" : "first";
            var popLocation = a.getAttribute("data-location")!== "null" ? 'Available location: '+a.getAttribute("data-location"):'';
            console.log(a.getAttribute("data-location"));
            a.querySelector(".bk-popup").insertAdjacentHTML("beforeend", "\n\t\t\t\t\t\t<div class=\"bk-timeslot-info\">\n\t\t\t\t\t\t\t<h1>Available times:</h1>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"bk-timeslot bk-half-booked\">\n\t\t\t\t\t\t\t<input type=\"radio\" name=\"booking-time\" id=\"bk-time-first\" value=\"".concat(e, "\">\n\t\t\t\t\t\t\t<div class=\"time-checkbox\"></div>\n\t\t\t\t\t\t\t<label class=\"time-label\" for=\"bk-time-first\">Half day: ").concat(d, "</label>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"bk-timeslot-location\">"+popLocation+"</div>\n\t\t\t\t\t"))
        }
        else a.classList.contains("bk-date--booked") ? '' : a.querySelector(".bk-popup").insertAdjacentHTML("beforeend", "\n\t\t\t\t\t\t<div class=\"bk-timeslot-info\">\n\t\t\t\t\t\t\t<h1>Select a time:</h1>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"bk-timeslot\">\n\t\t\t\t\t\t\t<input type=\"radio\" name=\"booking-time\" id=\"bk-time-full\" value=\"full\">\n\t\t\t\t\t\t\t<div class=\"time-checkbox\"></div>\n\t\t\t\t\t\t\t<label class=\"time-label\" for=\"bk-time-full\">Full day: ".concat(u.getAttribute("data-t0"), "</label>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"bk-timeslot\">\n\t\t\t\t\t\t\t<input type=\"radio\" name=\"booking-time\" id=\"bk-time-first\" value=\"first\">\n\t\t\t\t\t\t\t<div class=\"time-checkbox\"></div>\n\t\t\t\t\t\t\t<label class=\"time-label\" for=\"bk-time-first\">Half day: ").concat(u.getAttribute("data-t1"), "</label>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"bk-timeslot\">\n\t\t\t\t\t\t\t<input type=\"radio\" name=\"booking-time\" id=\"bk-time-last\" value=\"last\">\n\t\t\t\t\t\t\t<div class=\"time-checkbox\"></div>\n\t\t\t\t\t\t\t<label class=\"time-label\" for=\"bk-time-last\">Half day: ").concat(u.getAttribute("data-t2"), "</label>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<!--<button class=\"bk-timeslot-action\">Book this time</button>-->\n\t\t\t\t\t"));
        // else a.classList.contains("bk-date--booked") ? a.querySelector(".bk-popup").insertAdjacentHTML("beforeend", "\n\t\t\t\t\t\t<div class=\"bk-timeslot-info\">\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t") : a.querySelector(".bk-popup").insertAdjacentHTML("", "\n\t\t\t\t\t\t<div class=\"bk-timeslot-info\">\n\t\t\t\t\t\t\t<h1>Select a time:</h1>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"bk-timeslot\">\n\t\t\t\t\t\t\t<input type=\"radio\" name=\"booking-time\" id=\"bk-time-full\" value=\"full\">\n\t\t\t\t\t\t\t<div class=\"time-checkbox\"></div>\n\t\t\t\t\t\t\t<label class=\"time-label\" for=\"bk-time-full\">Full day: ".concat(u.getAttribute("data-t0"), "</label>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"bk-timeslot\">\n\t\t\t\t\t\t\t<input type=\"radio\" name=\"booking-time\" id=\"bk-time-first\" value=\"first\">\n\t\t\t\t\t\t\t<div class=\"time-checkbox\"></div>\n\t\t\t\t\t\t\t<label class=\"time-label\" for=\"bk-time-first\">Half day: ").concat(u.getAttribute("data-t1"), "</label>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"bk-timeslot\">\n\t\t\t\t\t\t\t<input type=\"radio\" name=\"booking-time\" id=\"bk-time-last\" value=\"last\">\n\t\t\t\t\t\t\t<div class=\"time-checkbox\"></div>\n\t\t\t\t\t\t\t<label class=\"time-label\" for=\"bk-time-last\">Half day: ").concat(u.getAttribute("data-t2"), "</label>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<!--<button class=\"bk-timeslot-action\">Book this time</button>-->\n\t\t\t\t\t"));
        setTimeout(function() {
            a.querySelector(".bk-popup").classList.remove("bk-hidden")
        },10);
        a.querySelector(".bk-popup").classList.remove("bk-hidden")
        
    }

    function n(a) {
        return ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][a]
    }

    function o() {
        w.innerHTML = "", x.innerHTML = ""
    }

    function p() {
        for (var a = 0; a < O.length; a++) O[a].classList.remove("bk-date--selected"), u.classList.remove("popup-open")
    }

    function q() {
        return new Promise(function(a, b) {
            var c = {
                    action: "call",
                    security: Ajax.security,
                    type: "icon",
                    cal: u.getAttribute("data-cal"),
                    admin: !1
                },
                d = new FormData;
            for (var e in c) d.append(e, c[e]);
            fetch(Ajax.ajaxurl, {
                method: "POST",
                credentials: "same-origin",
                body: d
            }).then(function(a) {
                return a.json()
            }).then(function(b) {
                a(b)
            }).catch(function(a) {
                b(a)
            })
        })
    }
    var r = document,
        d = {},
        s = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        t = r.querySelector("#bk-med-wrapper"),
        u = r.querySelector("#bk-calendar"),
        v = r.querySelectorAll("[data-calendar-area=\"month\"]"),
        w = r.querySelectorAll("[data-calendar-area=\"month\"]")[0],
        x = r.querySelectorAll("[data-calendar-area=\"month\"]")[1],
        y = r.querySelectorAll("[data-calendar-toggle=\"next\"]:not(.bk-mobi-next)")[0],
        z = r.querySelectorAll("[data-calendar-toggle=\"next\"].bk-mobi-next")[0],
        A = r.querySelectorAll("[data-calendar-toggle=\"previous\"]")[0],
        B = r.querySelectorAll("[data-calendar-label=\"month\"]")[0],
        C = r.querySelectorAll("[data-calendar-label=\"month\"]")[1],
        D = r.querySelector(".bk-form-booking select"),
        E = r.querySelector(".bk-form-location select"),
        F = r.querySelector("form#bk-form"),
        G = r.querySelector(".bk-form-group.bk-form-booking"),
        H = r.querySelector(".bk-form-group.bk-form-location"),
        I = r.querySelectorAll(".bk-form-group.bk-required:not(.bk-form-booking):not(.bk-form-location)"),
        J = r.querySelector("#bk-form input.bk-submit"),
        K = r.querySelector("#bk-form .bk-submit-info"),
        L = r.querySelector("#bk-form .bk-form-file input"),
        M = r.querySelector("#bk-form .bk-form-file p.bk-file-text"),
        N = r.querySelector("input#booking_day"),
        O = null,
        P = new Date,
        Q = new Date,
        R = new Date,
        S = [],
        T = !1;
    D.addEventListener("change", function() {
            var a = r.querySelector(".chosen-time span");
            a.innerHTML = D.querySelector("option:checked").innerHTML
        }), L && L.addEventListener("change", function() {
            if ("" == L.value) M.innerHTML = "No document selected<br><span>Only .PDF and .DOCX supported</span>", L.parentNode.parentNode.classList.contains("bk-required") && (L.parentNode.parentNode.classList.remove("ready"), L.parentNode.parentNode.classList.add("bk-status-is"), a());
            else {
                var b = L.files[0].size / 1024 / 1024,
                    c = L.files[0].type;
                "application/pdf" != c && "application/vnd.openxmlformats-officedocument.wordprocessingml.document" != c ? (alert("Please make sure your upload is a .PDF or .DOCX file type"), L.parentNode.parentNode.classList.remove("ready"), L.parentNode.parentNode.classList.add("bk-status-is"), a()) : 2 < b ? (alert("Please select a file less the 2MB in size"), L.parentNode.parentNode.classList.remove("ready"), L.parentNode.parentNode.classList.add("bk-status-is"), a()) : (M.innerHTML = "Document selected", L.parentNode.parentNode.classList.contains("bk-required") && (L.parentNode.parentNode.classList.add("ready"), L.parentNode.parentNode.classList.remove("bk-status-is"), a()))
            }
        }),
        function(a) {
            "interactive" === r.readyState || "complete" === r.readyState ? a() : r.addEventListener("DOMContentLoaded", a)
        }(function() {
            b()
        })
}]);

$(document).ready(function() {
    $("input").attr('autocomplete', 'off');
});