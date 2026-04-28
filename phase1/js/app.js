/* ============================================
   DISASTER RELIEF COORDINATION PORTAL — App Logic
   jQuery required, no other frameworks
   ============================================ */

$(function () {
  // ======== DATA STORE ========
  let nextTaskId = 5;
  let nextVolId = 5;
  let completedToday = 0;

  let tasks = [
    {
      id: 1,
      title: 'Medical Supply Distribution',
      description: 'Distribute medical supplies to the eastern district shelters. Priority items include first aid kits, medications, and PPE.',
      priority: 'critical',
      status: 'active',
      minVolunteers: 4,
      requiredSkills: ['Medical', 'Logistics'],
      assignedVolunteers: [1]
    },
    {
      id: 2,
      title: 'Search & Rescue Sector B',
      description: 'Conduct search and rescue sweep of collapsed structures in Sector B. Heavy equipment required.',
      priority: 'critical',
      status: 'pending',
      minVolunteers: 6,
      requiredSkills: ['Search and Rescue', 'Engineering'],
      assignedVolunteers: []
    },
    {
      id: 3,
      title: 'Shelter Setup at Central Park',
      description: 'Set up temporary shelters and triage center at Central Park for displaced residents.',
      priority: 'high',
      status: 'active',
      minVolunteers: 3,
      requiredSkills: ['First Aid', 'Logistics'],
      assignedVolunteers: [2]
    },
    {
      id: 4,
      title: 'Water Purification Station',
      description: 'Install and operate portable water purification station at the community center.',
      priority: 'medium',
      status: 'pending',
      minVolunteers: 2,
      requiredSkills: ['Engineering'],
      assignedVolunteers: []
    }
  ];

  let volunteers = [
    { id: 1, name: 'Sarah Mitchell', email: 'sarah@relief.org', skills: ['Medical', 'First Aid'], availability: 'available' },
    { id: 2, name: 'James Rodriguez', email: 'james@relief.org', skills: ['Logistics', 'Engineering'], availability: 'available' },
    { id: 3, name: 'Aisha Khan', email: 'aisha@relief.org', skills: ['Search and Rescue', 'First Aid'], availability: 'available' },
    { id: 4, name: 'David Chen', email: 'david@relief.org', skills: ['Engineering', 'Logistics'], availability: 'available' }
  ];

  // ======== CURRENT FILTER STATE ========
  let currentFilter = 'all';
  let currentSearch = '';

  // ======== INIT ========
  renderAll();

  // ======== TAB NAVIGATION ========
  $('#main-nav').on('click', '.tab-btn', function () {
    const tab = $(this).data('tab');
    $('.tab-btn').removeClass('active');
    $(this).addClass('active');
    $('.tab-panel').removeClass('active');
    $('#panel-' + tab).addClass('active');
    if (tab === 'tasks') renderTaskList('#task-list-tab', '#filter-bar-tasks', '#search-tasks-tab');
    if (tab === 'volunteers') renderVolunteersGrid();
  });

  // ======== RENDER HELPERS ========
  function renderAll() {
    updateStats();
    renderTaskList('#task-list', '#filter-bar', '#search-tasks');
    renderVolunteers();
  }

  function updateStats() {
    const activeTasks = tasks.filter(t => t.status === 'active').length;
    const criticalTasks = tasks.filter(t => t.priority === 'critical').length;
    $('#stat-active-tasks').text(activeTasks);
    $('#stat-critical-tasks').text(criticalTasks);
    $('#stat-volunteers').text(volunteers.length);
    $('#stat-completed-today').text(completedToday);
  }

  // ======== TASK RENDERING ========
  function getFilteredTasks() {
    let filtered = tasks;
    if (currentFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === currentFilter);
    }
    if (currentSearch.trim()) {
      const q = currentSearch.trim().toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q));
    }
    return filtered;
  }

  function buildTaskCard(task) {
    const statusClass = 'status-' + task.status;
    const priorityClass = 'priority-' + task.priority;
    const badgeClass = 'badge-' + task.priority;
    const assignDisabled = task.status === 'completed' ? ' disabled' : '';
    const assignedNames = task.assignedVolunteers.map(vid => {
      const v = volunteers.find(v => v.id === vid);
      return v ? v.name : '';
    }).filter(Boolean);

    return `
      <div class="task-card ${priorityClass}" data-task-id="${task.id}">
        <div class="task-card-header">
          <div class="task-card-header-left">
            <span class="priority-badge ${badgeClass}">${task.priority}</span>
            <span class="task-title">${escHtml(task.title)}</span>
          </div>
          <button class="btn-delete-task" data-task-id="${task.id}" title="Delete task">&times;</button>
        </div>
        <div class="task-desc">${escHtml(task.description)}</div>
        <div class="task-card-footer">
          <div class="task-meta">
            <span class="status-badge ${statusClass}" data-task-id="${task.id}">${task.status}</span>
            <span class="assigned-count">👤 ${task.assignedVolunteers.length} assigned</span>
          </div>
          <div class="assign-wrapper">
            <button class="btn-assign${assignDisabled}" data-task-id="${task.id}">Assign</button>
            <div class="assign-dropdown" data-task-id="${task.id}"></div>
          </div>
        </div>
      </div>`;
  }

  function renderTaskList(listSel, filterBarSel, searchSel) {
    const $list = $(listSel);
    const filtered = getFilteredTasks();
    $list.empty();
    if (filtered.length === 0) {
      $list.html('<div style="text-align:center;color:var(--text-muted);padding:2rem;font-size:.85rem;">No tasks found.</div>');
      return;
    }
    filtered.forEach(t => $list.append(buildTaskCard(t)));
  }

  // ======== FILTER & SEARCH (Dashboard) ========
  $(document).on('click', '#filter-bar .pill, #filter-bar-tasks .pill', function () {
    const $bar = $(this).closest('.filter-bar');
    $bar.find('.pill').removeClass('active');
    $(this).addClass('active');
    currentFilter = $(this).data('filter');
    renderTaskList('#task-list', '#filter-bar', '#search-tasks');
    renderTaskList('#task-list-tab', '#filter-bar-tasks', '#search-tasks-tab');
  });

  $(document).on('input', '#search-tasks, #search-tasks-tab', function () {
    currentSearch = $(this).val();
    $('#search-tasks, #search-tasks-tab').val(currentSearch);
    renderTaskList('#task-list', '#filter-bar', '#search-tasks');
    renderTaskList('#task-list-tab', '#filter-bar-tasks', '#search-tasks-tab');
  });

  // ======== STATUS CYCLING ========
  $(document).on('click', '.status-badge', function () {
    const taskId = $(this).data('task-id');
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const cycle = ['pending', 'active', 'completed'];
    const idx = cycle.indexOf(task.status);
    const prevStatus = task.status;
    task.status = cycle[(idx + 1) % cycle.length];

    // Track completed today
    if (task.status === 'completed' && prevStatus !== 'completed') completedToday++;
    if (prevStatus === 'completed' && task.status !== 'completed') completedToday = Math.max(0, completedToday - 1);

    updateStats();
    renderTaskList('#task-list', '#filter-bar', '#search-tasks');
    renderTaskList('#task-list-tab', '#filter-bar-tasks', '#search-tasks-tab');
  });

  // ======== DELETE TASK ========
  $(document).on('click', '.btn-delete-task', function () {
    const taskId = $(this).data('task-id');
    const $card = $(this).closest('.task-card');
    const task = tasks.find(t => t.id === taskId);

    // Set max-height before removing for transition
    $card.css('max-height', $card.outerHeight() + 'px');

    // Trigger reflow then add removing class
    $card[0].offsetHeight; // force reflow
    $card.addClass('removing');

    setTimeout(function () {
      tasks = tasks.filter(t => t.id !== taskId);
      $card.remove();
      updateStats();
      // Also re-render the other list if needed
      renderTaskList('#task-list-tab', '#filter-bar-tasks', '#search-tasks-tab');
    }, 300);
  });

  // ======== ASSIGN VOLUNTEER DROPDOWN ========
  $(document).on('click', '.btn-assign', function (e) {
    e.stopPropagation();
    const taskId = $(this).data('task-id');
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === 'completed') return;

    // Close any open dropdowns
    $('.assign-dropdown').removeClass('open');

    const $dropdown = $(this).siblings('.assign-dropdown');
    $dropdown.empty();

    const available = volunteers.filter(v =>
      v.availability === 'available' && !task.assignedVolunteers.includes(v.id)
    );

    if (available.length === 0) {
      $dropdown.html('<div class="no-volunteers">No available volunteers</div>');
    } else {
      available.forEach(v => {
        $dropdown.append(`<div class="dropdown-item" data-vol-id="${v.id}" data-task-id="${taskId}">${escHtml(v.name)} — ${v.skills.join(', ')}</div>`);
      });
    }
    $dropdown.addClass('open');
  });

  // Close dropdowns on outside click
  $(document).on('click', function () {
    $('.assign-dropdown').removeClass('open');
  });

  // Assign volunteer from dropdown
  $(document).on('click', '.dropdown-item', function (e) {
    e.stopPropagation();
    const volId = $(this).data('vol-id');
    const taskId = $(this).data('task-id');
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.assignedVolunteers.push(volId);
    $('.assign-dropdown').removeClass('open');
    updateStats();
    renderTaskList('#task-list', '#filter-bar', '#search-tasks');
    renderTaskList('#task-list-tab', '#filter-bar-tasks', '#search-tasks-tab');
  });

  // ======== VOLUNTEERS RENDERING ========
  function renderVolunteers() {
    const $list = $('#volunteer-list');
    $list.empty();
    const available = volunteers.filter(v => v.availability === 'available');
    if (available.length === 0) {
      $list.html('<div style="text-align:center;color:var(--text-muted);padding:1rem;font-size:.8rem;">No available volunteers.</div>');
      return;
    }
    available.forEach(v => {
      $list.append(buildVolunteerCard(v));
    });
  }

  function renderVolunteersGrid() {
    const $grid = $('#volunteer-grid-tab');
    $grid.empty();
    if (volunteers.length === 0) {
      $grid.html('<div style="text-align:center;color:var(--text-muted);padding:2rem;">No volunteers registered.</div>');
      return;
    }
    volunteers.forEach(v => {
      $grid.append(buildVolunteerCard(v));
    });
  }

  function buildVolunteerCard(v) {
    const tags = v.skills.map(s => `<span class="vol-tag">${escHtml(s)}</span>`).join('');
    const statusDot = v.availability === 'available' ? '🟢' : '🔴';
    return `
      <div class="volunteer-card" data-vol-id="${v.id}">
        <div class="vol-name">${statusDot} ${escHtml(v.name)}</div>
        <div class="vol-detail">📧 ${escHtml(v.email)}</div>
        <div class="vol-tags">${tags}</div>
      </div>`;
  }

  // ======== CREATE TASK MODAL ========
  $('#btn-open-task-modal, #btn-open-task-modal-tab').on('click', function () {
    resetTaskForm();
    $('#task-modal-overlay').addClass('open');
  });
  $('#task-modal-close').on('click', function () {
    $('#task-modal-overlay').removeClass('open');
  });
  $('#task-modal-overlay').on('click', function (e) {
    if ($(e.target).is('#task-modal-overlay')) $(this).removeClass('open');
  });

  // Live character counter
  $('#task-description').on('input', function () {
    const len = $(this).val().length;
    const remaining = 200 - len;
    const $counter = $('#desc-counter');
    $counter.text(remaining + ' / 200');
    if (remaining < 0) {
      $counter.addClass('overlimit');
    } else {
      $counter.removeClass('overlimit');
    }
    // Clear error when typing
    $('#desc-error').removeClass('show').text('');
  });

  // Clear title error on typing
  $('#task-title').on('input', function () {
    $('#title-error').removeClass('show').text('');
  });

  // Submit task form
  $('#task-form').on('submit', function (e) {
    e.preventDefault();

    const title = $('#task-title').val().trim();
    const priority = $('#task-priority').val();
    const minVol = parseInt($('#task-min-volunteers').val()) || 1;
    const desc = $('#task-description').val();
    const skills = [];
    $('#task-form .checkbox-group input:checked').each(function () {
      skills.push($(this).val());
    });

    let valid = true;

    // Title validation
    if (!title || title.length < 5) {
      $('#title-error').text('Title must be more than 5 characters').addClass('show');
      valid = false;
    }

    // Description validation
    if (!desc.trim()) {
      $('#desc-error').text('Description is required').addClass('show');
      valid = false;
    } else if (desc.length > 200) {
      $('#desc-error').text('Description exceeds 200 characters').addClass('show');
      valid = false;
    }

    if (!valid) return;

    const newTask = {
      id: nextTaskId++,
      title: title,
      description: desc.trim(),
      priority: priority,
      status: 'pending',
      minVolunteers: minVol,
      requiredSkills: skills,
      assignedVolunteers: []
    };

    tasks.unshift(newTask);
    $('#task-modal-overlay').removeClass('open');
    renderAll();
  });

  function resetTaskForm() {
    $('#task-title').val('');
    $('#task-priority').val('medium');
    $('#task-min-volunteers').val(1);
    $('#task-description').val('');
    $('#desc-counter').text('200 / 200').removeClass('overlimit');
    $('#task-form .checkbox-group input').prop('checked', false);
    $('#title-error, #desc-error').removeClass('show').text('');
  }

  // ======== REGISTER VOLUNTEER MODAL ========
  $('#btn-open-volunteer-modal, #btn-open-volunteer-modal-tab').on('click', function () {
    resetVolunteerForm();
    $('#volunteer-modal-overlay').addClass('open');
  });
  $('#volunteer-modal-close').on('click', function () {
    $('#volunteer-modal-overlay').removeClass('open');
  });
  $('#volunteer-modal-overlay').on('click', function (e) {
    if ($(e.target).is('#volunteer-modal-overlay')) $(this).removeClass('open');
  });

  // Clear errors on typing
  $('#vol-name').on('input', function () { $('#vol-name-error').removeClass('show'); });
  $('#vol-email').on('input', function () { $('#vol-email-error').removeClass('show'); });

  $('#volunteer-form').on('submit', function (e) {
    e.preventDefault();

    const name = $('#vol-name').val().trim();
    const email = $('#vol-email').val().trim();
    const skills = [];
    $('#vol-skills-group input:checked').each(function () {
      skills.push($(this).val());
    });

    let valid = true;

    if (!name) {
      $('#vol-name-error').text('Full name is required').addClass('show');
      valid = false;
    }
    if (!email) {
      $('#vol-email-error').text('Email is required').addClass('show');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $('#vol-email-error').text('Enter a valid email address').addClass('show');
      valid = false;
    }

    if (!valid) return;

    const newVol = {
      id: nextVolId++,
      name: name,
      email: email,
      skills: skills,
      availability: 'available'
    };

    volunteers.push(newVol);
    $('#volunteer-modal-overlay').removeClass('open');
    renderAll();
    renderVolunteersGrid();
  });

  function resetVolunteerForm() {
    $('#vol-name').val('');
    $('#vol-email').val('');
    $('#vol-skills-group input').prop('checked', false);
    $('#vol-name-error, #vol-email-error').removeClass('show').text('');
  }

  // ======== UTILITY ========
  function escHtml(str) {
    return $('<div>').text(str).html();
  }
});
