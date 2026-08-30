const storedLocale = localStorage.getItem("cwp-locale");
const locale = storedLocale === "zh-CN" ? "zh-CN" : "en";
const translations = {
  en: {
    localWorkbench: "LOCAL WORKBENCH",
    skipMain: "Skip to main content",
    mainNavigation: "Main navigation",
    dashboard: "DASHBOARD",
    orchestration: "ORCHESTRATION",
    governance: "GOVERNANCE",
    context: "CONTEXT",
    observability: "OBSERVABILITY",
    overview: "Overview",
    workflows: "Workflows",
    approvals: "Approvals",
    projects: "Projects",
    activity: "Activity",
    events: "Events",
    tasks: "Tasks",
    updated: "Updated ",
    dispatch: "Dispatch",
    pause: "Pause",
    resume: "Resume",
    takeover: "Take over",
    terminate: "Terminate",
    retry: "Retry",
    removeRun: "Remove history",
    approve: "Approve",
    reject: "Reject",
    runWorkflow: "Run workflow",
    deleteWorkflow: "Delete workflow",
    deleteProject: "Delete project",
    viewBrief: "View brief",
    saveOrder: "Save order",
    orderDirty: "Order changed; not saved",
    orderSaved: "Order saved",
    removeSlot: "Remove slot",
    addSlot: "Add node slot",
    noConversations: "No resumable conversations",
    loading: "Loading…",
    nothingAttention: "Nothing needs attention",
    noActiveRuns: "No active runs",
    emptyProjects: "No projects yet.",
    emptyWorkflows: "No workflows yet.",
    emptyRuns: "No runs yet.",
    actionSubmitted: "Action submitted",
    actionFailed: "Action failed: ",
    confirmDeleteProject:
      "Delete this project permanently? Its records, workflows, and local directory cannot be recovered.",
    confirmDeleteWorkflow:
      "Delete this workflow permanently? Its nodes, runs, and approvals cannot be recovered.",
    confirmDeleteRun: "Remove this historical run?",
    confirmLinearize:
      "This workflow contains branches or unselected nodes. Saving will replace the existing dependencies with a linear order. Continue?",
    enterTitle: "Please enter a name.",
    enterPrompt: "Please enter a prompt.",
    projectBriefFailed: "Project brief failed: ",
    live: "Live connection",
    disconnected: "Connection interrupted; retrying",
    unboundProject: "Unbound project",
    verifyEnvironment: "Verify environment",
    environment: "Execution environment",
    defaultDirectory: "Default project directory",
    saveDirectory: "Save directory",
    chooseDirectory: "Choose…",
    filterEvents: "Filter events",
    currentRuns: "Current runs",
    needsAttention: "Needs attention",
    viewAll: "View all",
    openApprovals: "Open approvals",
    newWorkflow: "New workflow",
    defineFirst: "Define first, run second",
    name: "Name",
    project: "Project",
    description: "Description",
    createWorkflow: "Create workflow",
    addNode: "Add node",
    workflow: "Workflow",
    nodeTitle: "Node title",
    adapter: "Adapter",
    action: "Action",
    model: "Model",
    reasoning: "Reasoning",
    maxRuntime: "Max runtime (minutes)",
    noProgress: "No-progress timeout (minutes)",
    maxAttempts: "Max attempts",
    promptTemplate: "Prompt template",
    addNodeButton: "Add node",
    dependencies: "Dependencies",
    dependencyHint: "Use slots to preview and save execution order.",
    workflowDefinitions: "Workflow definitions",
    oneOffRun: "Create a run",
    oneOffHint: "One-off task",
    runTitle: "Run title",
    taskPrompt: "Task prompt",
    createDispatch: "Create and dispatch",
    allRuns: "All runs",
    approvalTitle: "Approval center",
    approvalSubtitle: "Review high-risk execution and record every decision.",
    pendingApprovals: "Pending approvals",
    projectsTitle: "Projects and briefs",
    projectsSubtitle:
      "Keep goals, decisions, ownership, and pitfalls close to the work.",
    newProject: "New project",
    projectName: "Project name",
    createProject: "Create project",
    selectProject: "Select a project to view its brief.",
    activityTitle: "Activity and audit",
    activitySubtitle:
      "Follow live events, verified artifacts, and local Codex conversations.",
    loadMore: "Load more",
    conversations: "Codex conversations",
    conversation: "Conversation",
    conversationGone:
      "This Codex conversation is no longer available locally and cannot be continued.",
    noEvents: "No events yet.",
    moveUp: "Move up",
    moveDown: "Move down",
    sendFollowup: "Send follow-up",
    readOnly: "Read-only task",
    fileChange: "File change (approval required)",
    command: "Command (approval required)",
    network: "Network (approval required)",
    appServer: "Local Codex App Server (session)",
    automatic: "Automatic",
    disabled: "Disabled",
    autoDelegation: "Automatic delegation",
    selected: "Selected",
    edit: "Edit",
    nodes: "nodes",
    dependenciesCount: "dependencies",
    runsCount: "runs",
    providerLabel: "Provider: ",
    allowedWorkspaces: "Allowed workspaces: ",
    verifying: "Verifying…",
    revealQuotes: "Reveal owner quotes",
    advancedOptions: "Advanced execution options",
    delegation: "Delegation",
    maxSubagents: "Max subagents",
    subagentModel: "Subagent model",
    subagentReasoning: "Subagent reasoning",
    tokenBudget: "Token budget",
    costBudget: "Cost budget",
    workingDirectory: "Working directory",
    policyManual:
      "Approval policy: manual by default. Network search is enabled, but network actions still require approval.",
    policyAutomatic: "Approval policy: automatic (explicitly enabled).",
    policyManualNetworkOff:
      "Approval policy: manual by default. Network search is disabled.",
    gettingStarted: "GET STARTED",
    onboardingTitle: "Your first local workflow",
    onboardingIntro:
      "Complete these steps once. The workbench keeps your data on this computer.",
    onboardingEnvironment: "Verify Codex",
    onboardingProject: "Create a project",
    onboardingWorkflow: "Build a workflow",
    onboardingRun: "Run and review",
    verifyNow: "Verify now",
    openProjects: "Open projects",
    openWorkflows: "Open workflows",
    dispatchFirstRun: "Dispatch a run",
    stepComplete: "Complete",
    environmentPending: "Confirm the CLI, ChatGPT login, and execution path.",
    projectPending: "Choose a local workspace and name the project.",
    workflowPending: "Add one or more nodes and save their order.",
    runPending: "Dispatch a task and review its approvals and activity.",
    environmentReady: "CLI and App Server are ready.",
    environmentCliFallback:
      "CLI is ready; App Server is unavailable, so CLI is selected.",
    environmentUnavailable:
      "Codex is not ready. Install or sign in, then verify again.",
    verificationTakesTime:
      "Running a real read-only probe; this can take up to two minutes.",
    verificationTimedOut:
      "Verification did not finish in two minutes. Check Activity or try again.",
    appServerUnavailable: "Local Codex App Server (unavailable)",
    localCli: "Local Codex CLI",
  },
  zh: {
    localWorkbench: "本地工作台",
    skipMain: "跳到主要内容",
    mainNavigation: "主导航",
    dashboard: "总览",
    overview: "总览",
    workflows: "工作流",
    approvals: "审批",
    projects: "项目",
    activity: "活动",
    overviewTitle: "工作台总览",
    overviewSubtitle: "查看项目状态、执行风险和需要处理的事项。",
    currentRuns: "当前运行",
    needsAttention: "等待处理",
    viewAll: "查看全部",
    openApprovals: "进入审批",
    environment: "执行环境",
    verifyEnvironment: "验证执行环境",
    orchestration: "编排",
    workflowsTitle: "工作流",
    workflowsSubtitle: "定义依赖、检查策略并派发本机 Codex。",
    newWorkflow: "新建工作流",
    defineFirst: "先定义，再运行",
    name: "名称",
    project: "项目",
    unboundProject: "不绑定项目",
    description: "说明",
    createWorkflow: "创建工作流",
    addNode: "添加节点",
    workflow: "工作流",
    nodeTitle: "节点名称",
    adapter: "执行器",
    action: "动作类型",
    model: "主模型",
    reasoning: "思考程度",
    maxRuntime: "最长运行（分钟）",
    noProgress: "无进展停止（分钟）",
    maxAttempts: "最大尝试次数",
    promptTemplate: "提示模板",
    addNodeButton: "添加节点",
    dependencies: "节点依赖",
    dependencyHint: "使用节点框预览并保存执行顺序。",
    workflowDefinitions: "工作流定义",
    oneOffRun: "直接创建运行",
    oneOffHint: "临时任务入口",
    runTitle: "运行标题",
    taskPrompt: "任务提示",
    createDispatch: "创建并派发",
    allRuns: "全部运行",
    governance: "治理",
    approvalTitle: "审批中心",
    approvalSubtitle: "审核高风险执行并记录每次决定。",
    pendingApprovals: "待审批",
    context: "上下文",
    projectsTitle: "项目与说明",
    projectsSubtitle: "让目标、决定、负责人和踩坑记录靠近工作。",
    newProject: "新建项目",
    projectName: "项目名称",
    createProject: "创建项目",
    selectProject: "选择项目后查看说明。",
    observability: "可观测性",
    activityTitle: "活动与审计",
    activitySubtitle: "查看实时事件、已验证产物和本地 Codex 会话。",
    events: "事件",
    loadMore: "加载更多",
    filterEvents: "筛选事件",
    conversations: "Codex 会话",
    conversation: "会话",
    noConversations: "暂无可继续的会话",
    noEvents: "暂无事件。",
    sendFollowup: "发送继续提示",
    readOnly: "只读任务",
    fileChange: "文件修改（需审批）",
    command: "命令执行（需审批）",
    network: "网络访问（需审批）",
    appServer: "本机 Codex App Server（会话）",
    automatic: "自动",
    disabled: "不使用",
    autoDelegation: "自动分派",
    selected: "已选择",
    edit: "编辑",
    nodes: "个节点",
    dependenciesCount: "项依赖",
    runsCount: "次运行",
    providerLabel: "提供商：",
    allowedWorkspaces: "允许工作目录：",
    verifying: "验证中…",
    revealQuotes: "显示负责人原话",
    advancedOptions: "高级执行选项",
    delegation: "分派策略",
    maxSubagents: "最大子代理数",
    subagentModel: "子代理模型",
    subagentReasoning: "子代理思考程度",
    tokenBudget: "Token 预算",
    costBudget: "成本预算",
    workingDirectory: "工作目录",
    policyManual:
      "审批策略：默认人工审批。网络搜索已开启，但网络动作仍需审批。",
    policyAutomatic: "审批策略：自动批准（已显式开启）。",
    policyManualNetworkOff: "审批策略：默认人工审批。网络搜索已关闭。",
    defaultDirectory: "本机项目默认目录",
    saveDirectory: "保存目录",
    chooseDirectory: "选择…",
    emptyProjects: "暂无项目。",
    emptyWorkflows: "暂无工作流。",
    emptyRuns: "暂无运行。",
    noActiveRuns: "暂无活跃运行。",
    nothingAttention: "没有需要立即处理的事项。",
    loading: "正在加载…",
    updated: "更新时间 ",
    live: "实时连接正常",
    disconnected: "连接中断，正在重试",
    approve: "批准",
    reject: "拒绝",
    runWorkflow: "运行工作流",
    deleteWorkflow: "永久删除工作流",
    deleteProject: "永久删除项目",
    viewBrief: "查看项目说明",
    removeRun: "移除历史记录",
    retry: "重试",
    pause: "暂停",
    resume: "恢复",
    takeover: "接管",
    terminate: "终止",
    dispatch: "派发",
    saveOrder: "保存执行顺序",
    orderSaved: "当前顺序已保存",
    orderDirty: "顺序已改变，尚未保存",
    addSlot: "添加节点框",
    removeSlot: "删除此框",
    conversationGone: "该 Codex 会话已不在本机存储中，无法继续读取。",
    projectBriefFailed: "项目说明读取失败：",
    actionSubmitted: "操作已提交",
    actionFailed: "操作失败：",
    confirmDeleteProject:
      "确认永久删除此项目？项目记录、关联工作流和本地目录都将不可恢复。",
    confirmDeleteWorkflow:
      "确认永久删除此工作流？关联节点、运行记录和审批记录都将不可恢复。",
    confirmDeleteRun: "确认移除这条历史运行记录？",
    confirmLinearize:
      "当前工作流包含分支或未选择节点。保存会用线性顺序替换现有依赖，是否继续？",
    enterTitle: "请输入名称。",
    enterPrompt: "请输入提示。",
    moveUp: "上移",
    moveDown: "下移",
    gettingStarted: "开始使用",
    onboardingTitle: "创建你的第一个本机工作流",
    onboardingIntro: "这些步骤只需完成一次；工作台数据保留在当前电脑中。",
    onboardingEnvironment: "验证 Codex",
    onboardingProject: "创建项目",
    onboardingWorkflow: "编排工作流",
    onboardingRun: "运行并检查结果",
    verifyNow: "立即验证",
    openProjects: "进入项目",
    openWorkflows: "进入工作流",
    dispatchFirstRun: "派发一次运行",
    stepComplete: "已完成",
    environmentPending: "确认 CLI、ChatGPT 登录和真实执行链路。",
    projectPending: "选择本机工作目录并创建项目。",
    workflowPending: "添加一个或多个节点并保存执行顺序。",
    runPending: "派发任务，并在审批和活动页面检查结果。",
    environmentReady: "CLI 和 App Server 均已就绪。",
    environmentCliFallback: "CLI 已就绪；App Server 不可用，已自动选择 CLI。",
    environmentUnavailable: "Codex 尚未就绪；请安装或登录后重新验证。",
    verificationTakesTime: "正在执行真实只读探针，最多可能需要两分钟。",
    verificationTimedOut: "两分钟内未完成验证；请检查活动记录或重试。",
    appServerUnavailable: "本机 Codex App Server（不可用）",
    localCli: "本机 Codex CLI",
  },
};
const zh = translations.zh;
const en = translations.en;
const t = (key) => (locale === "zh-CN" ? zh[key] || key : en[key] || key);
const $ = (id) => document.getElementById(id);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];
let requestToken = "";
let latest = null;
let projectData = { projects: [] };
let selectedWorkflowId = null;
let selectedConversationId = "";
let statePromise = null;
let stateReloadTimer = null;
let eventAfter = 0;
let eventBefore = Number.MAX_SAFE_INTEGER;
let toastTimer = null;
let conversationRequest = null;
let briefRequest = null;
let environmentState = {
  checking: true,
  cliAvailable: false,
  cliReady: false,
  appServerReady: false,
};

function text(value) {
  return document.createTextNode(String(value ?? ""));
}
function clear(node) {
  node.replaceChildren();
  return node;
}
function optionalNumber(id) {
  const value = $(id)?.value?.trim() ?? "";
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
function button(label, className = "secondary", onClick) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `button ${className}`;
  element.textContent = label;
  if (onClick) element.addEventListener("click", onClick);
  return element;
}
function showToast(message, kind = "") {
  const node = $("toast");
  if (!node) return;
  node.textContent = message;
  node.className = `toast ${kind}`;
  node.setAttribute("role", kind === "error" ? "alert" : "status");
  node.setAttribute("aria-live", kind === "error" ? "assertive" : "polite");
  node.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    node.hidden = true;
  }, 3200);
}
function localizeStatic() {
  document.documentElement.lang = locale;
  all("[data-i18n]").forEach((node) => {
    node.textContent =
      locale === "zh-CN"
        ? zh[node.dataset.i18n] || node.textContent
        : node.textContent;
  });
  if (locale === "zh-CN") {
    all("[placeholder]").forEach((node) => {
      const value = node.getAttribute("placeholder");
      const map = {
        "Code review and repair": "代码检查与修复",
        "Goal and completion criteria": "说明目标和完成判据",
        "Inspect existing tests": "检查现有测试",
        "auto or model ID": "auto 或模型 ID",
        "State the goal, inputs, constraints, and completion criteria":
          "写清目标、输入、限制和完成条件",
        "Web-dispatched Codex task": "网页派发的 Codex 工作",
        "Inspect the current project and return a structured report; do not modify files.":
          "检查当前项目状态并返回结构化结果；不要修改文件。",
        "Continue the conversation…": "继续对话…",
      };
      if (map[value]) node.setAttribute("placeholder", map[value]);
    });
  }
  $("locale-toggle").textContent = locale === "zh-CN" ? "English" : "中文";
  $("locale-toggle").setAttribute(
    "aria-label",
    locale === "zh-CN" ? "Switch to English" : "切换到中文",
  );
  document
    .querySelector(".main-nav")
    ?.setAttribute("aria-label", t("mainNavigation"));
}
function setView(name) {
  all(".view").forEach((view) => {
    view.hidden = view.id !== `view-${name}`;
  });
  all(".nav-button").forEach((node) => {
    const active = node.dataset.view === name;
    node.classList.toggle("active", active);
    if (active) node.setAttribute("aria-current", "page");
    else node.removeAttribute("aria-current");
  });
  history.replaceState(
    null,
    "",
    `${location.pathname}${location.search}#${name}`,
  );
  if (name === "projects") void loadProjects();
}
function selectedGraph() {
  if (!latest || !selectedWorkflowId) return null;
  const workflow = latest.workflows.find(
    (item) => item.id === selectedWorkflowId,
  );
  if (!workflow) return null;
  return {
    workflow,
    nodes: latest.workflowNodes.filter(
      (item) => item.workflowId === workflow.id,
    ),
    edges: latest.workflowEdges.filter(
      (item) => item.workflowId === workflow.id,
    ),
  };
}
async function api(url, options = {}) {
  const { timeoutMs = 15_000, ...requestOptions } = options;
  const method = String(requestOptions.method || "GET").toUpperCase();
  const headers = new Headers(requestOptions.headers || {});
  if (method !== "GET" && method !== "HEAD") {
    headers.set("content-type", "application/json");
    headers.set(
      "idempotency-key",
      headers.get("idempotency-key") || crypto.randomUUID(),
    );
    if (requestToken) headers.set("x-cwp-request-token", requestToken);
  }
  const timeoutSignal =
    !requestOptions.signal &&
    Number.isFinite(timeoutMs) &&
    timeoutMs > 0 &&
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(timeoutMs)
      : undefined;
  const response = await fetch(url, {
    ...requestOptions,
    method,
    headers,
    signal: requestOptions.signal || timeoutSignal,
    cache: requestOptions.cache || "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(payload.code || `HTTP_${response.status}`);
  return payload;
}
function stateFor(run) {
  if (["FAILED", "MANUAL_INTERVENTION"].includes(run.state)) return "bad";
  if (["WAITING_USER", "PAUSED", "VERIFYING"].includes(run.state))
    return "wait";
  return "";
}
const stateLabel = (value) => {
  const labels = {
    RUNNING: locale === "zh-CN" ? "执行中" : "Running",
    QUEUED: locale === "zh-CN" ? "排队中" : "Queued",
    WAITING_USER: locale === "zh-CN" ? "等待处理" : "Needs approval",
    PAUSED: locale === "zh-CN" ? "已暂停" : "Paused",
    VERIFYING: locale === "zh-CN" ? "验证中" : "Verifying",
    COMPLETED: locale === "zh-CN" ? "已完成" : "Completed",
    FAILED: locale === "zh-CN" ? "失败" : "Failed",
    MANUAL_INTERVENTION:
      locale === "zh-CN" ? "需人工接管" : "Manual intervention",
    PENDING: locale === "zh-CN" ? "待审批" : "Pending",
    APPROVED: locale === "zh-CN" ? "已批准" : "Approved",
    REJECTED: locale === "zh-CN" ? "已拒绝" : "Rejected",
    DRAFT: locale === "zh-CN" ? "草稿" : "Draft",
    ACTIVE: locale === "zh-CN" ? "活动" : "Active",
  };
  return labels[value] || value;
};
function actionButtons(run) {
  const fragment = document.createDocumentFragment();
  if (run.state === "QUEUED")
    fragment.append(
      button(t("dispatch"), "primary", () =>
        act(`/api/p10/runs/${run.id}/dispatch`, {}),
      ),
    );
  if (run.state === "RUNNING")
    fragment.append(
      button(t("pause"), "secondary", () =>
        act(`/api/p10/runs/${run.id}/actions`, { action: "PAUSE" }),
      ),
    );
  if (run.state === "PAUSED")
    fragment.append(
      button(t("resume"), "primary", () =>
        act(`/api/p10/runs/${run.id}/actions`, { action: "RESUME" }),
      ),
    );
  if (["RUNNING", "PAUSED", "WAITING_USER"].includes(run.state)) {
    fragment.append(
      button(t("takeover"), "secondary", () =>
        act(`/api/p10/runs/${run.id}/actions`, { action: "TAKEOVER" }),
      ),
    );
    fragment.append(
      button(t("terminate"), "danger", () =>
        act(`/api/p10/runs/${run.id}/actions`, { action: "TERMINATE" }),
      ),
    );
  }
  if (
    ["FAILED", "MANUAL_INTERVENTION"].includes(run.state) &&
    Number(run.attempt || 1) < Number(run.maxAttempts || 2)
  )
    fragment.append(
      button(
        `${t("retry")} (${run.attempt || 1}/${run.maxAttempts || 2})`,
        "secondary",
        () => act(`/api/p10/runs/${run.id}/retry`, {}),
      ),
    );
  if (["FAILED", "MANUAL_INTERVENTION", "COMPLETED"].includes(run.state))
    fragment.append(
      button(t("removeRun"), "danger", async () => {
        if (!confirm(t("confirmDeleteRun"))) return;
        await act(`/api/p10/runs/${run.id}`, {}, "DELETE");
      }),
    );
  return fragment;
}
function runCard(run) {
  const article = document.createElement("article");
  article.className = "run-card";
  const head = document.createElement("div");
  head.className = "card-head";
  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = run.title;
  const state = document.createElement("span");
  state.className = `state ${stateFor(run)}`;
  state.textContent = stateLabel(run.state);
  head.append(title, state);
  article.append(head);
  const meta = document.createElement("div");
  meta.className = "card-meta";
  meta.textContent = `${run.adapter || "mock"} · ${run.phase || ""} · ${Number(run.progress || 0)}% · ${String(run.id).slice(0, 8)}`;
  article.append(meta);
  if (run.displayError || run.error) {
    const error = document.createElement("div");
    error.className = "card-meta error";
    error.textContent = run.displayError || run.error;
    article.append(error);
  }
  const progress = document.createElement("div");
  progress.className = "progress";
  const bar = document.createElement("span");
  bar.style.width = `${Math.max(0, Math.min(100, Number(run.progress || 0)))}%`;
  progress.append(bar);
  article.append(progress);
  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(actionButtons(run));
  article.append(actions);
  return article;
}
function approvalCard(approval) {
  const article = document.createElement("article");
  article.className = "approval-card";
  const head = document.createElement("div");
  head.className = "card-head";
  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = approval.action;
  const state = document.createElement("span");
  state.className = "state wait";
  state.textContent = stateLabel(approval.state);
  head.append(title, state);
  article.append(head);
  const meta = document.createElement("div");
  meta.className = "card-meta";
  meta.textContent = `${approval.reason || ""} · ${String(approval.runId).slice(0, 8)} · ${new Date(approval.expiresAt).toLocaleTimeString()}`;
  article.append(meta);
  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(
    button(t("approve"), "primary", () =>
      act(`/api/p10/approvals/${approval.id}`, {
        decision: "APPROVED",
        approver: "web-operator",
      }),
    ),
    button(t("reject"), "danger", () =>
      act(`/api/p10/approvals/${approval.id}`, {
        decision: "REJECTED",
        approver: "web-operator",
      }),
    ),
  );
  article.append(actions);
  return article;
}
function workflowCard(workflow) {
  const nodes = latest.workflowNodes.filter(
    (node) => node.workflowId === workflow.id,
  );
  const edges = latest.workflowEdges.filter(
    (edge) => edge.workflowId === workflow.id,
  );
  const executions = latest.workflowExecutions.filter(
    (execution) => execution.workflowId === workflow.id,
  );
  const article = document.createElement("article");
  article.className = "workflow-card";
  const head = document.createElement("div");
  head.className = "card-head";
  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = workflow.title;
  const state = document.createElement("span");
  state.className = "state";
  state.textContent = stateLabel(workflow.state);
  head.append(title, state);
  article.append(head);
  const meta = document.createElement("div");
  meta.className = "card-meta";
  meta.textContent =
    locale === "zh-CN"
      ? `v${workflow.version} · ${nodes.length}${t("nodes")} · ${edges.length}${t("dependenciesCount")} · ${executions.length}${t("runsCount")}`
      : `v${workflow.version} · ${nodes.length} ${t("nodes")} · ${edges.length} ${t("dependenciesCount")} · ${executions.length} ${t("runsCount")}`;
  article.append(meta);
  nodes.forEach((node, index) => {
    const row = document.createElement("div");
    row.className = "card-meta";
    row.textContent = `${index + 1}. ${node.title} · ${node.adapter}`;
    article.append(row);
  });
  const actions = document.createElement("div");
  actions.className = "card-actions";
  actions.append(
    button(
      workflow.id === selectedWorkflowId ? t("selected") : t("edit"),
      "secondary",
      () => {
        selectedWorkflowId = workflow.id;
        render();
      },
    ),
    button(t("runWorkflow"), "primary", () =>
      act(`/api/p10/workflows/${workflow.id}/runs`, {}),
    ),
    button(t("deleteWorkflow"), "danger", async () => {
      if (!confirm(t("confirmDeleteWorkflow"))) return;
      await act(`/api/p10/workflows/${workflow.id}`, {}, "DELETE");
    }),
  );
  article.append(actions);
  return article;
}
function renderSummary() {
  const node = clear($("summary"));
  const metrics = [
    [t("projects"), projectData.projects?.length || 0],
    [t("workflows"), latest?.workflows?.length || 0],
    [t("events"), latest?.eventTotal ?? latest?.events?.length ?? 0],
    [
      t("approvals"),
      latest?.approvals?.filter((item) => item.state === "PENDING").length || 0,
    ],
  ];
  metrics.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "metric";
    const l = document.createElement("label");
    l.textContent = label;
    const v = document.createElement("strong");
    v.textContent = String(value);
    item.append(l, v);
    node.append(item);
  });
}
function setOnboardingStep(id, complete, pendingText) {
  const item = $(`onboarding-${id}`);
  if (!item) return;
  item.classList.toggle("complete", complete);
  const status = $(`onboarding-${id}-status`);
  if (status) status.textContent = complete ? t("stepComplete") : pendingText;
  const action = item.querySelector("button");
  if (action) action.hidden = complete;
}
function renderOnboarding() {
  const panel = $("onboarding-panel");
  if (!panel) return;
  const projects = projectData.projects?.length || 0;
  const workflows = latest?.workflows?.length || 0;
  const runs = latest?.runs?.length || 0;
  const environmentText = environmentState.cliReady
    ? environmentState.appServerReady
      ? t("environmentReady")
      : t("environmentCliFallback")
    : environmentState.checking || environmentState.cliAvailable
      ? t("environmentPending")
      : t("environmentUnavailable");
  setOnboardingStep("environment", environmentState.cliReady, environmentText);
  setOnboardingStep("project", projects > 0, t("projectPending"));
  setOnboardingStep("workflow", workflows > 0, t("workflowPending"));
  setOnboardingStep("run", runs > 0, t("runPending"));
  panel.hidden =
    environmentState.cliReady && projects > 0 && workflows > 0 && runs > 0;
}
const orderDrafts = new Map();
const orderKnownNodes = new Map();
function renderOrderEditor() {
  const root = clear($("order-editor"));
  const graph = selectedGraph();
  if (!graph || !graph.nodes.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = graph ? t("emptyRuns") : t("emptyWorkflows");
    root.append(p);
    return;
  }
  const incoming = new Map(graph.nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(graph.nodes.map((node) => [node.id, 0]));
  graph.edges.forEach((edge) => {
    incoming.set(edge.toNodeId, (incoming.get(edge.toNodeId) || 0) + 1);
    outgoing.set(edge.fromNodeId, (outgoing.get(edge.fromNodeId) || 0) + 1);
  });
  const roots = graph.nodes
    .filter((node) => incoming.get(node.id) === 0)
    .map((node) => node.id);
  let currentLinearOrder = null;
  if (
    roots.length === 1 &&
    graph.edges.length === Math.max(0, graph.nodes.length - 1) &&
    [...incoming.values()].every((count) => count <= 1) &&
    [...outgoing.values()].every((count) => count <= 1)
  ) {
    const next = new Map(
      graph.edges.map((edge) => [edge.fromNodeId, edge.toNodeId]),
    );
    const visited = new Set();
    const order = [];
    let cursor = roots[0];
    while (cursor && !visited.has(cursor)) {
      visited.add(cursor);
      order.push(cursor);
      cursor = next.get(cursor);
    }
    if (order.length === graph.nodes.length) currentLinearOrder = order;
  }
  const fallback =
    currentLinearOrder ||
    roots.concat(
      graph.nodes.map((node) => node.id).filter((id) => !roots.includes(id)),
    );
  const nodeIds = graph.nodes.map((node) => node.id);
  const storedDraft = orderDrafts.get(graph.workflow.id);
  const knownNodes = orderKnownNodes.get(graph.workflow.id);
  let draft = storedDraft?.filter((id) => nodeIds.includes(id)) || [
    ...fallback,
  ];
  if (storedDraft && knownNodes)
    draft.push(
      ...nodeIds.filter((id) => !knownNodes.has(id) && !draft.includes(id)),
    );
  if (!draft.length) draft = fallback;
  orderDrafts.set(graph.workflow.id, draft);
  orderKnownNodes.set(graph.workflow.id, new Set(nodeIds));
  const editor = document.createElement("div");
  editor.className = "order-editor";
  const list = document.createElement("div");
  list.className = "order-list";
  list.setAttribute("role", "list");
  let draggedIndex = -1;
  let focusIndex = null;
  const move = (from, to) => {
    if (to < 0 || to >= draft.length) return;
    [draft[from], draft[to]] = [draft[to], draft[from]];
    orderDrafts.set(graph.workflow.id, draft);
    focusIndex = to;
    renderSlots();
  };
  const renderSlots = () => {
    clear(list);
    draft.forEach((id, index) => {
      const row = document.createElement("div");
      row.className = "order-item";
      row.dataset.index = String(index);
      row.draggable = true;
      row.tabIndex = 0;
      row.setAttribute("role", "listitem");
      row.setAttribute(
        "aria-label",
        `${graph.nodes.find((node) => node.id === id)?.title || id} ${index + 1}`,
      );
      const handle = document.createElement("span");
      handle.className = "order-handle";
      handle.textContent = "⋮⋮";
      handle.setAttribute("aria-hidden", "true");
      handle.title = locale === "zh-CN" ? "拖动调整顺序" : "Drag to reorder";
      const number = document.createElement("span");
      number.className = "order-number";
      number.textContent = String(index + 1);
      const select = document.createElement("select");
      select.setAttribute("aria-label", `${t("nodeTitle")} ${index + 1}`);
      graph.nodes.forEach((node) => {
        const option = new Option(node.title, node.id, false, node.id === id);
        option.disabled = draft.includes(node.id) && node.id !== id;
        select.add(option);
      });
      select.addEventListener("change", () => {
        draft[index] = select.value;
        orderDrafts.set(graph.workflow.id, draft);
        renderSlots();
      });
      const remove = button(t("removeSlot"), "danger", () => {
        draft.splice(index, 1);
        orderDrafts.set(graph.workflow.id, draft);
        focusIndex = Math.min(index, draft.length - 1);
        renderSlots();
      });
      const up = button(t("moveUp"), "secondary", () => move(index, index - 1));
      up.disabled = index === 0;
      up.setAttribute("aria-label", `${t("moveUp")} ${index + 1}`);
      const down = button(t("moveDown"), "secondary", () =>
        move(index, index + 1),
      );
      down.disabled = index === draft.length - 1;
      down.setAttribute("aria-label", `${t("moveDown")} ${index + 1}`);
      row.append(handle, number, select, up, down, remove);
      row.addEventListener("dragstart", (event) => {
        draggedIndex = index;
        row.classList.add("dragging");
        event.dataTransfer?.setData("text/plain", String(index));
      });
      row.addEventListener("dragend", () => {
        draggedIndex = -1;
        row.classList.remove("dragging");
      });
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        row.classList.add("drop-target");
      });
      row.addEventListener("dragleave", () =>
        row.classList.remove("drop-target"),
      );
      row.addEventListener("drop", (event) => {
        event.preventDefault();
        row.classList.remove("drop-target");
        const source =
          draggedIndex >= 0
            ? draggedIndex
            : Number(event.dataTransfer?.getData("text/plain"));
        if (
          !Number.isInteger(source) ||
          source < 0 ||
          source >= draft.length ||
          source === index
        )
          return;
        const [moved] = draft.splice(source, 1);
        draft.splice(index, 0, moved);
        orderDrafts.set(graph.workflow.id, draft);
        renderSlots();
      });
      row.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp" && index > 0) {
          move(index, index - 1);
          event.preventDefault();
        }
        if (event.key === "ArrowDown" && index < draft.length - 1) {
          move(index, index + 1);
          event.preventDefault();
        }
      });
      list.append(row);
    });
    if (focusIndex !== null) {
      const target = list.children[focusIndex];
      focusIndex = null;
      target?.focus();
    }
  };
  renderSlots();
  editor.append(list);
  const actions = document.createElement("div");
  actions.className = "order-actions";
  const add = button(t("addSlot"), "secondary", () => {
    const unused = graph.nodes.find((node) => !draft.includes(node.id));
    if (unused) draft.push(unused.id);
    orderDrafts.set(graph.workflow.id, draft);
    renderSlots();
  });
  const save = button(t("saveOrder"), "primary", async () => {
    if (needsLinearizeConfirmation && !confirm(t("confirmLinearize"))) return;
    const saved = await act(`/api/p10/workflows/${graph.workflow.id}/order`, {
      nodeIds: draft,
      expectedVersion: graph.workflow.version,
    });
    if (!saved) return;
    orderDrafts.set(graph.workflow.id, [...draft]);
    orderKnownNodes.set(
      graph.workflow.id,
      new Set(graph.nodes.map((node) => node.id)),
    );
  });
  const status = document.createElement("span");
  status.className = "order-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const expectedEdges = draft
    .slice(1)
    .map((nodeId, index) => `${draft[index]}\u0000${nodeId}`);
  const actualEdges = new Set(
    graph.edges.map((edge) => `${edge.fromNodeId}\u0000${edge.toNodeId}`),
  );
  const edgeMatch =
    actualEdges.size === expectedEdges.length &&
    expectedEdges.every((edge) => actualEdges.has(edge));
  const existingIsLinear = currentLinearOrder !== null;
  const needsLinearizeConfirmation =
    draft.length < graph.nodes.length ||
    (graph.edges.length > 0 && !existingIsLinear);
  status.textContent = edgeMatch ? t("orderSaved") : t("orderDirty");
  status.classList.toggle("dirty", !edgeMatch);
  save.disabled = edgeMatch;
  add.disabled = draft.length >= graph.nodes.length;
  actions.append(add, status, save);
  editor.append(actions);
  root.append(editor);
}
function renderWorkflows() {
  const workflowList = clear($("workflow-list"));
  (latest?.workflows || []).forEach((workflow) =>
    workflowList.append(workflowCard(workflow)),
  );
  if (!workflowList.children.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = t("emptyWorkflows");
    workflowList.append(p);
  }
  $("workflow-total").textContent =
    `${latest?.workflows?.length || 0} ${t("workflows").toLowerCase()}`;
  const workflows = latest?.workflows || [];
  if (
    !selectedWorkflowId ||
    !workflows.some((item) => item.id === selectedWorkflowId)
  )
    selectedWorkflowId = workflows[0]?.id || null;
  const select = $("node-workflow");
  clear(select);
  workflows.forEach((workflow) =>
    select.add(
      new Option(
        workflow.title,
        workflow.id,
        false,
        workflow.id === selectedWorkflowId,
      ),
    ),
  );
  const graph = selectedGraph();
  $("selected-workflow-version").textContent = graph
    ? `v${graph.workflow.version}`
    : t("emptyWorkflows");
  renderOrderEditor();
}
function renderRuns() {
  const runs = latest?.runs || [];
  const active = runs.filter(
    (run) =>
      !["COMPLETED", "FAILED", "MANUAL_INTERVENTION"].includes(run.state),
  );
  const overview = clear($("overview-runs"));
  active.slice(0, 4).forEach((run) => overview.append(runCard(run)));
  if (!overview.children.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = t("noActiveRuns");
    overview.append(p);
  }
  const list = clear($("run-list"));
  runs
    .slice()
    .reverse()
    .forEach((run) => list.append(runCard(run)));
  if (!list.children.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = t("emptyRuns");
    list.append(p);
  }
  $("run-total").textContent = `${runs.length} ${t("allRuns").toLowerCase()}`;
}
function renderApprovals() {
  const pending = (latest?.approvals || []).filter(
    (item) => item.state === "PENDING",
  );
  const list = clear($("approval-list"));
  pending.forEach((item) => list.append(approvalCard(item)));
  if (!list.children.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = t("nothingAttention");
    list.append(p);
  }
  const overview = clear($("overview-approvals"));
  pending.slice(0, 4).forEach((item) => overview.append(approvalCard(item)));
  if (!overview.children.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = t("nothingAttention");
    overview.append(p);
  }
}
function renderEvents() {
  const query = $("event-filter")?.value.trim().toLowerCase() || "";
  const list = clear($("event-list"));
  (latest?.events || [])
    .filter(
      (event) =>
        !query ||
        `${event.type} ${event.summary || ""}`.toLowerCase().includes(query),
    )
    .slice()
    .reverse()
    .forEach((event) => {
      const row = document.createElement("li");
      row.textContent = `#${event.sequence} · ${event.type} · ${new Date(event.timestamp || event.createdAt).toLocaleString()}`;
      list.append(row);
    });
  if (!list.children.length) {
    const p = document.createElement("li");
    p.className = "empty";
    p.textContent = t("noEvents");
    list.append(p);
  }
}
function renderConversations() {
  const select = $("conversation-select");
  const runs = (latest?.runs || []).filter(
    (run) => run.adapter === "local-codex-app-server" && run.adapterThreadId,
  );
  const prior = selectedConversationId || select.value;
  clear(select);
  if (!runs.length) {
    select.add(new Option(t("noConversations"), ""));
    $("conversation-transcript").textContent = t("noConversations");
    $("conversation-prompt").disabled = true;
    $("conversation-form").querySelector("button").disabled = true;
    selectedConversationId = "";
    return;
  }
  runs.forEach((run) =>
    select.add(
      new Option(
        `${run.title} · ${run.adapterThreadId.slice(0, 8)}`,
        run.adapterThreadId,
        false,
        run.adapterThreadId === prior,
      ),
    ),
  );
  const next = runs.some((run) => run.adapterThreadId === prior)
    ? prior
    : runs[0].adapterThreadId;
  select.value = next;
  $("conversation-prompt").disabled = false;
  $("conversation-form").querySelector("button").disabled = false;
  if (next !== selectedConversationId) {
    selectedConversationId = next;
    void loadConversation(next);
  }
}
async function loadConversation(threadId) {
  if (!threadId) return;
  conversationRequest?.abort();
  conversationRequest = new AbortController();
  const request = conversationRequest;
  const output = $("conversation-transcript");
  output.textContent = t("loading");
  try {
    const payload = await api(
      `/api/p10/conversations/${encodeURIComponent(threadId)}`,
      { signal: request.signal },
    );
    const turns = payload.thread?.turns || [];
    output.textContent = turns.length
      ? turns
          .map((turn) =>
            [
              `TURN ${turn.id || ""} · ${turn.status || ""}`,
              ...(turn.items || []).map(
                (item) =>
                  `[${item.type || "item"}] ${item.text || item.command || item.summary || item.status || ""}`,
              ),
            ].join("\n"),
          )
          .join("\n")
      : t("noConversations");
  } catch (error) {
    if (error.name === "AbortError") return;
    output.textContent =
      error.message.includes("410") ||
      error.message.includes("CONVERSATION_NOT_FOUND") ||
      error.message.includes("rollout") ||
      error.message.includes("not loaded")
        ? t("conversationGone")
        : `${t("projectBriefFailed")}${error.message}`;
  } finally {
    if (conversationRequest === request) conversationRequest = null;
  }
}
function render() {
  renderSummary();
  renderOnboarding();
  renderWorkflows();
  renderRuns();
  renderApprovals();
  renderEvents();
  renderConversations();
  const active = (latest?.runs || []).filter(
    (run) =>
      !["COMPLETED", "FAILED", "MANUAL_INTERVENTION"].includes(run.state),
  ).length;
  const pending = (latest?.approvals || []).filter(
    (item) => item.state === "PENDING",
  ).length;
  $("overview-status").textContent =
    locale === "zh-CN"
      ? `活跃运行 ${active} 个 · 待审批 ${pending} 项`
      : `Active runs: ${active} · Pending approvals: ${pending}`;
  $("nav-run-count").textContent = String(active);
  $("nav-approval-count").textContent = String(pending);
}
async function loadState() {
  if (statePromise) return statePromise;
  statePromise = api("/api/p10/state?eventLimit=200")
    .then((data) => {
      latest = data;
      eventAfter = Number(data.latestEventSequence || eventAfter);
      eventBefore = Number(data.events?.[0]?.sequence || eventBefore);
      $("freshness").textContent =
        `${t("updated")}${new Date().toLocaleTimeString()}`;
      render();
      return data;
    })
    .catch((error) => {
      showToast(error.message, "error");
      throw error;
    })
    .finally(() => {
      statePromise = null;
    });
  return statePromise;
}
function scheduleStateLoad() {
  clearTimeout(stateReloadTimer);
  stateReloadTimer = setTimeout(() => void loadState(), 120);
}
async function loadProjects() {
  try {
    projectData = await api("/api/status?limit=50");
    const select = $("workflow-project");
    clear(select);
    select.add(new Option(t("unboundProject"), ""));
    const runProject = $("run-project");
    clear(runProject);
    runProject.add(new Option(t("unboundProject"), ""));
    projectData.projects.forEach((project) =>
      select.add(new Option(project.title, project.id)),
    );
    projectData.projects.forEach((project) =>
      runProject.add(new Option(project.title, project.id)),
    );
    const queryProject = new URLSearchParams(location.search).get("project");
    if (queryProject) {
      select.value = queryProject;
      runProject.value = queryProject;
    }
    const list = clear($("project-list"));
    projectData.projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card";
      const head = document.createElement("div");
      head.className = "card-head";
      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = project.title;
      const state = document.createElement("span");
      state.className = "state";
      state.textContent = stateLabel(project.state);
      head.append(title, state);
      card.append(head);
      const meta = document.createElement("div");
      meta.className = "card-meta";
      meta.textContent = project.projectDirectory || project.id;
      card.append(meta);
      const actions = document.createElement("div");
      actions.className = "card-actions";
      actions.append(
        button(t("viewBrief"), "secondary", () => loadBrief(project.id)),
        button(t("deleteProject"), "danger", async () => {
          if (!confirm(t("confirmDeleteProject"))) return;
          await act(
            `/api/projects/${encodeURIComponent(project.id)}`,
            {},
            "DELETE",
          );
        }),
      );
      card.append(actions);
      list.append(card);
    });
    if (!list.children.length) {
      const p = document.createElement("p");
      p.className = "empty";
      p.textContent = t("emptyProjects");
      list.append(p);
    }
    const selected =
      new URLSearchParams(location.search).get("project") ||
      projectData.projects[0]?.id;
    if (selected) await loadBrief(selected);
    renderSummary();
    renderOnboarding();
  } catch (error) {
    showToast(error.message, "error");
  }
}
async function loadSettings() {
  try {
    const data = await api("/api/p10/settings");
    $("workspace-root").value = data.projectRoot || "";
    $("run-cwd").value = data.projectRoot || data.workspaceRoot || "";
  } catch (error) {
    showToast(error.message, "error");
  }
}
async function loadBrief(projectId, revealQuotes = false) {
  briefRequest?.abort();
  briefRequest = new AbortController();
  const request = briefRequest;
  const panel = clear($("brief-panel"));
  const loading = document.createElement("p");
  loading.className = "muted";
  loading.textContent = t("loading");
  panel.append(loading);
  try {
    const data = await api(
      `/api/projects/${encodeURIComponent(projectId)}${revealQuotes ? "/brief/quotes" : "/brief"}`,
      revealQuotes
        ? { method: "POST", body: JSON.stringify({}), signal: request.signal }
        : { signal: request.signal },
    );
    clear(panel);
    const title = document.createElement("h3");
    title.textContent = data.project?.title || projectId;
    panel.append(title);
    const objective = document.createElement("p");
    objective.textContent =
      data.project?.objective ||
      (locale === "zh-CN"
        ? "尚未记录项目目标。"
        : "Project objective not recorded.");
    panel.append(objective);
    const quoteButton = button(t("revealQuotes"), "secondary", () =>
      loadBrief(projectId, true),
    );
    panel.append(quoteButton);
    const sections = data.projectRecords || {};
    Object.entries(sections).forEach(([name, records]) => {
      const heading = document.createElement("h4");
      heading.textContent = name.replaceAll("_", " ");
      panel.append(heading);
      (records || []).slice(0, 10).forEach((record) => {
        const p = document.createElement("p");
        p.textContent =
          record.text ||
          record.content ||
          record.summary ||
          JSON.stringify(record);
        panel.append(p);
      });
    });
  } catch (error) {
    if (error.name === "AbortError") return;
    clear(panel);
    const p = document.createElement("p");
    p.className = "error";
    p.textContent = `${t("projectBriefFailed")}${error.message}`;
    panel.append(p);
  } finally {
    if (briefRequest === request) briefRequest = null;
  }
}
async function act(url, body, method = "POST") {
  try {
    await api(url, { method, body: JSON.stringify(body) });
    showToast(t("actionSubmitted"));
    await loadState();
    if (url.includes("/api/projects")) await loadProjects();
    return true;
  } catch (error) {
    showToast(`${t("actionFailed")}${error.message}`, "error");
    return false;
  }
}
async function verifyEnvironment() {
  const buttons = [$("verify-environment"), $("onboarding-verify")].filter(
    Boolean,
  );
  buttons.forEach((buttonNode) => {
    buttonNode.disabled = true;
    buttonNode.setAttribute("aria-busy", "true");
    buttonNode.textContent = t("verifying");
  });
  environmentState.checking = true;
  $("environment-detail").textContent = t("verificationTakesTime");
  renderOnboarding();
  try {
    const payload = await api("/api/p10/codex/status?refresh=1&verify=1", {
      timeoutMs: 135_000,
    });
    applyEnvironment(payload, true);
  } catch (error) {
    environmentState.checking = false;
    const timedOut =
      error.name === "TimeoutError" ||
      /timed? out|timeout/i.test(error.message);
    $("environment-title").textContent = timedOut
      ? t("verificationTimedOut")
      : error.message;
    renderOnboarding();
  } finally {
    buttons.forEach((buttonNode) => {
      buttonNode.disabled = false;
      buttonNode.removeAttribute("aria-busy");
      buttonNode.textContent =
        buttonNode.id === "onboarding-verify"
          ? t("verifyNow")
          : t("verifyEnvironment");
    });
  }
}
function syncAdapterOptions(local, appServer) {
  const appServerReady = Boolean(
    appServer?.available &&
    appServer?.authenticated &&
    appServer?.capabilities?.executionVerified === true,
  );
  for (const id of ["node-adapter", "run-adapter"]) {
    const select = $(id);
    if (!select) continue;
    const appOption = select.querySelector(
      'option[value="local-codex-app-server"]',
    );
    const cliOption = select.querySelector('option[value="local-codex-cli"]');
    if (appOption) {
      appOption.disabled = !appServerReady;
      appOption.textContent = appServerReady
        ? t("appServer")
        : t("appServerUnavailable");
    }
    if (cliOption) cliOption.textContent = t("localCli");
    if (!appServerReady && select.value === "local-codex-app-server")
      select.value = "local-codex-cli";
  }
  environmentState.appServerReady = appServerReady;
  environmentState.cliAvailable = Boolean(
    local?.available && local?.authenticated,
  );
  environmentState.cliReady = Boolean(
    environmentState.cliAvailable &&
    local?.capabilities?.executionVerified === true,
  );
  environmentState.checking = false;
}
function applyEnvironment(payload, verifiedRequest = false) {
  const local = payload.adapters.find(
    (item) => item.adapter === "local-codex-cli",
  );
  const appServer = payload.adapters.find(
    (item) => item.adapter === "local-codex-app-server",
  );
  syncAdapterOptions(local, appServer);
  const ready = environmentState.cliReady;
  $("environment-dot").classList.toggle("ready", ready);
  $("environment-title").textContent = ready
    ? environmentState.appServerReady
      ? t("environmentReady")
      : t("environmentCliFallback")
    : local?.available
      ? verifiedRequest
        ? locale === "zh-CN"
          ? "Codex CLI 验证失败"
          : "Codex CLI verification failed"
        : locale === "zh-CN"
          ? "Codex CLI 已检测，尚未执行验证"
          : "Codex CLI detected; execution not verified"
      : locale === "zh-CN"
        ? "未检测到可用的 Codex CLI"
        : "Codex CLI unavailable";
  $("environment-detail").textContent =
    local?.displayExecutionProbeDetail ||
    local?.reason ||
    appServer?.reason ||
    "";
  const providerLabel = local?.provider?.label || local?.provider?.name || "";
  $("environment-provider").textContent = providerLabel
    ? `${t("providerLabel")}${locale === "en" && providerLabel === "OpenAI 官方" ? "OpenAI official" : providerLabel}`
    : "";
  $("environment-workspace").textContent =
    `${t("allowedWorkspaces")}${(payload.allowedRoots || []).join(" · ")}`;
  renderOnboarding();
}
async function loadEnvironment() {
  try {
    const payload = await api("/api/p10/codex/status", { timeoutMs: 45_000 });
    applyEnvironment(payload, false);
  } catch (error) {
    environmentState.checking = false;
    $("environment-title").textContent = error.message;
    renderOnboarding();
  }
}
async function waitUntilReady() {
  let delay = 150;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await api("/readyz");
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(2000, Math.round(delay * 1.35));
    }
  }
  return false;
}
function bindForms() {
  $("workflow-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = $("workflow-title").value.trim();
    if (!title) return showToast(t("enterTitle"), "error");
    const ok = await act("/api/p10/workflows", {
      title,
      description: $("workflow-description").value,
      projectId: $("workflow-project").value || null,
    });
    if (ok) event.target.reset();
  });
  $("node-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const graph = selectedGraph();
    if (!graph) return showToast(t("emptyWorkflows"), "error");
    const title = $("node-title").value.trim();
    const promptTemplate = $("node-prompt").value.trim();
    if (!title || !promptTemplate) return showToast(t("enterPrompt"), "error");
    const ok = await act(`/api/p10/workflows/${graph.workflow.id}/nodes`, {
      title,
      promptTemplate,
      adapter: $("node-adapter").value,
      action: $("node-action").value,
      model: $("node-model").value.trim() || "auto",
      reasoningEffort: $("node-reasoning").value,
      timeoutMs: Number($("node-timeout").value || 30) * 60_000,
      noProgressTimeoutMs: Number($("node-no-progress").value || 5) * 60_000,
      maxAttempts: Number($("node-max-attempts").value || 2),
      delegation: $("node-delegation").value,
      maxSubagents: Number($("node-max-subagents").value || 4),
      subagentModel: $("node-subagent-model").value.trim() || "auto",
      subagentReasoningEffort: $("node-subagent-reasoning").value,
      tokenBudget: optionalNumber("node-token-budget"),
      costBudget: optionalNumber("node-cost-budget"),
      expectedVersion: graph.workflow.version,
    });
    if (ok) event.target.reset();
  });
  $("run-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = $("run-title").value.trim();
    const prompt = $("run-prompt").value.trim();
    if (!title || !prompt) return showToast(t("enterPrompt"), "error");
    await act("/api/p10/runs", {
      title,
      prompt,
      action: $("run-action").value,
      adapter: $("run-adapter").value,
      projectId: $("run-project").value || null,
      cwd: $("run-cwd").value.trim() || undefined,
      model: $("run-model").value.trim() || "auto",
      reasoningEffort: $("run-reasoning").value,
      delegation: $("run-delegation").value,
      maxSubagents: Number($("run-max-subagents").value || 4),
      subagentModel: $("run-subagent-model").value.trim() || "auto",
      subagentReasoningEffort: $("run-subagent-reasoning").value,
      timeoutMs: Number($("run-timeout").value || 30) * 60_000,
      noProgressTimeoutMs: Number($("run-no-progress").value || 5) * 60_000,
      maxAttempts: Number($("run-max-attempts").value || 2),
      tokenBudget: optionalNumber("run-token-budget"),
      costBudget: optionalNumber("run-cost-budget"),
    });
  });
  $("project-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = $("project-title").value.trim();
    if (!title) return showToast(t("enterTitle"), "error");
    const ok = await act("/api/projects", { title });
    if (ok) {
      event.target.hidden = true;
      event.target.reset();
    }
  });
  $("workspace-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const projectRoot = $("workspace-root").value.trim();
    if (!projectRoot) return showToast(t("enterTitle"), "error");
    await act("/api/p10/settings/project-root", { projectRoot });
  });
  $("pick-workspace").addEventListener("click", async () => {
    try {
      const data = await api("/api/p10/settings/pick-directory", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (data.projectRoot) {
        $("workspace-root").value = data.projectRoot;
        $("run-cwd").value = data.projectRoot;
      }
    } catch (error) {
      if (!/CANCELLED/i.test(error.message)) showToast(error.message, "error");
    }
  });
  $("new-project-toggle").addEventListener("click", () => {
    const form = $("project-form");
    form.hidden = !form.hidden;
    $("new-project-toggle").setAttribute("aria-expanded", String(!form.hidden));
    if (!form.hidden) $("project-title").focus();
  });
  $("conversation-select").addEventListener("change", (event) => {
    selectedConversationId = event.target.value;
    void loadConversation(selectedConversationId);
  });
  $("conversation-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const prompt = $("conversation-prompt").value.trim();
    if (!selectedConversationId || !prompt) return;
    const ok = await act(
      `/api/p10/conversations/${encodeURIComponent(selectedConversationId)}/turns`,
      { prompt },
    );
    if (ok) {
      $("conversation-prompt").value = "";
      setTimeout(() => void loadConversation(selectedConversationId), 500);
    }
  });
  $("load-more-events").addEventListener("click", async () => {
    try {
      const payload = await api(
        `/api/p10/events?before=${eventBefore}&limit=500`,
      );
      const list = $("event-list");
      const rows = payload.events
        .slice()
        .reverse()
        .map((event) => {
          const row = document.createElement("li");
          row.textContent = `#${event.sequence} · ${event.type} · ${new Date(event.timestamp || event.createdAt).toLocaleString()}`;
          return row;
        });
      rows.reverse().forEach((row) => list.prepend(row));
      eventBefore = Number(payload.nextBefore || eventBefore);
      $("load-more-events").disabled = !payload.hasMoreBefore;
    } catch (error) {
      showToast(error.message, "error");
    }
  });
  $("event-filter").addEventListener("input", renderEvents);
  $("verify-environment").addEventListener("click", verifyEnvironment);
  $("onboarding-verify").addEventListener("click", verifyEnvironment);
  all("[data-view]").forEach((node) =>
    node.addEventListener("click", () => setView(node.dataset.view)),
  );
  all("[data-go]").forEach((node) =>
    node.addEventListener("click", () => setView(node.dataset.go)),
  );
  $("locale-toggle").addEventListener("click", () => {
    localStorage.setItem("cwp-locale", locale === "zh-CN" ? "en" : "zh-CN");
    location.reload();
  });
}
async function boot() {
  localizeStatic();
  try {
    const config = await api("/api/p10/client-config");
    requestToken = config.requestToken || "";
    const approvalText =
      config.approvalDefault === "automatic"
        ? t("policyAutomatic")
        : config.networkDefault
          ? t("policyManual")
          : t("policyManualNetworkOff");
    $("policy-summary").textContent = approvalText;
  } catch {}
  bindForms();
  const initial = [
    "overview",
    "workflows",
    "approvals",
    "projects",
    "activity",
  ].includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : "overview";
  setView(initial);
  try {
    const ready = await waitUntilReady();
    if (!ready) throw Error("WORKBENCH_NOT_READY");
    $("live-status").textContent = t("live");
  } catch {
    $("live-status").textContent = t("disconnected");
    showToast(t("disconnected"), "error");
    setTimeout(() => location.reload(), 5000);
    return;
  }
  await Promise.all([loadState(), loadProjects(), loadSettings()]);
  void loadEnvironment();
  const stream = new EventSource("/api/p10/events/stream");
  stream.onopen = () => {
    $("live-status").textContent = t("live");
  };
  stream.onmessage = scheduleStateLoad;
  stream.onerror = () => {
    $("live-status").textContent = t("disconnected");
  };
  $("live-status").textContent = t("live");
}
boot().catch((error) => showToast(error.message, "error"));
