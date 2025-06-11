 document.addEventListener("DOMContentLoaded", function () {
      loadSavedTopics();
      generateSchedule();
    });

    function addRow(topic = "", date = "", color = "#0d6efd") {
      const table = document.getElementById("topicBody");
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="text" class="topicName" value="${topic}" placeholder="e.g. Graph Algorithms"></td>
        <td><input type="date" class="startDate" value="${date}"></td>
        <td><input type="color" class="topicColor" value="${color}" title="Pick a color"></td>
        <td><button class="delete-btn" onclick="removeRow(this)">Delete</button></td>
      `;
      table.appendChild(row);
      row.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", saveTopicsToStorage);
      });
    }

    function removeRow(btn) {
      btn.closest("tr").remove();
      saveTopicsToStorage();
    }

    function saveTopicsToStorage() {
      const rows = document.querySelectorAll("#topicBody tr");
      const topicData = [];
      rows.forEach(row => {
        const topic = row.querySelector(".topicName").value.trim();
        const date = row.querySelector(".startDate").value;
        const color = row.querySelector(".topicColor").value || "#0d6efd";
        if (topic && date) {
          topicData.push({ topic, date, color });
        }
      });
      localStorage.setItem("spacedTopics", JSON.stringify(topicData));
    }

    function loadSavedTopics() {
      document.getElementById("topicBody").innerHTML = "";
      const data = localStorage.getItem("spacedTopics");
      if (!data) return;
      const topics = JSON.parse(data);
      topics.forEach(item => addRow(item.topic, item.date, item.color || "#0d6efd"));
    }

    function generateSchedule() {
      const rows = document.querySelectorAll("#topicBody tr");
      const events = [];
      const topicData = [];
      const intervals = [0, 1, 3, 7, 14, 30];

      rows.forEach(row => {
        const topic = row.querySelector(".topicName").value.trim();
        const dateStr = row.querySelector(".startDate").value;
        const color = row.querySelector(".topicColor").value || "#0d6efd";
        const startDate = new Date(dateStr);
        if (!topic || isNaN(startDate)) return;

        topicData.push({ topic, date: dateStr, color });

        intervals.forEach((offset, i) => {
          const reviewDate = new Date(startDate);
          reviewDate.setDate(reviewDate.getDate() + offset);
          const isoDate = reviewDate.toISOString().split("T")[0];
          events.push({
            title: `Review ${i + 1}: ${topic}`,
            start: isoDate,
            allDay: true,
            backgroundColor: color
          });
        });
      });

      localStorage.setItem("spacedTopics", JSON.stringify(topicData));

      const calendarEl = document.getElementById("calendar");
      calendarEl.innerHTML = "";
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: 600,
        events: events,
        eventDidMount: function (info) {
          const today = new Date().toISOString().split("T")[0];
          if (info.event.startStr === today) {
            info.el.style.backgroundColor = "#ffc107";
            info.el.style.color = "black";
          }
        }
      });
      calendar.render();
      showToast("Calendar updated!");
    }

    function exportTopics() {
      const data = localStorage.getItem("spacedTopics");
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "topics_backup.json";
      a.click();
      showToast("Exported topics!");
    }

    function importTopics(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const data = JSON.parse(e.target.result);
          localStorage.setItem("spacedTopics", JSON.stringify(data));
          loadSavedTopics();
          generateSchedule();
          showToast("Imported topics!");
        } catch {
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    }

    function showToast(message) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.style.display = "block";
      setTimeout(() => toast.style.display = "none", 2000);
    }