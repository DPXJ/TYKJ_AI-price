// 轻量“会话仓库”与状态机（原型演示，不接后端）
const conversationStore = {
    list: [], // {id, title, createdAt, status, inputText, images}
    currentId: null
};

function createConversation(payload) {
    const id = 'C' + Date.now();
    const conv = {
        id,
        title: payload.title || 'AI诊断',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        status: 'queued', // queued -> running -> done/failed
        inputText: payload.inputText || '',
        images: payload.images || []
    };
    conversationStore.list.unshift(conv);
    conversationStore.currentId = id;
    return conv;
}

function getConversation(id) {
    return conversationStore.list.find(c => c.id === id);
}

function setConversationStatus(id, status) {
    const c = getConversation(id);
    if (c) c.status = status;
}

// 页面数据
const pageData = {
    home: {
        title: '首页',
        subtitle: '农业管理系统',
        content: `
            <div class="mobile-page workbench-page">
                <div class="mobile-header">
                    <h1>首页</h1>
                </div>
                <div class="mobile-content">
                    <!-- 气象灾害预警Banner -->
                    <div class="weather-alert-banner" id="weatherAlertBanner" onclick="loadWeatherReport()">
                        <div class="banner-content">
                            <div class="banner-icon" id="bannerIcon">
                                <i class="fas fa-cloud-sun-rain"></i>
                            </div>
                            <div class="banner-text">
                                <div class="banner-title" id="bannerTitle">柘城县今日气象平稳，适宜农事作业</div>
                                <div class="banner-subtitle" id="bannerSubtitle">点击查看详细预报</div>
                            </div>
                            <div class="banner-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 组织卡片 -->
                    <div class="card org-card">
                        <div class="org-row">
                            <div class="org-name">
                                龙腾虎跃有限公司（壹）
                            </div>
                            <div class="org-actions">
                                <a class="org-switch" href="javascript:void(0)">切换组织 <i class="fas fa-arrow-right"></i></a>
                                <button class="header-message-btn" onclick="showMessages()" style="margin-left: 10px;">
                                    <i class="fas fa-bell"></i>
                                    <span class="message-badge">3</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 统计概览 -->
                    <div class="card stats-card">
                        <div class="wb-stats-grid">
                            <div class="wb-stat-item">
                                <div class="wb-stat-number">2亩</div>
                                <div class="wb-stat-label">管理规模</div>
                            </div>
                            <div class="wb-stat-item">
                                <div class="wb-stat-number">1个</div>
                                <div class="wb-stat-label">管理项目</div>
                            </div>
                            <div class="wb-stat-item">
                                <div class="wb-stat-number">1/1个</div>
                                <div class="wb-stat-label">管理基地/地块</div>
                            </div>
                            <div class="wb-stat-item">
                                <div class="wb-stat-number">2亩</div>
                                <div class="wb-stat-label">当前播种</div>
                            </div>
                            <div class="wb-stat-item">
                                <div class="wb-stat-number">0种</div>
                                <div class="wb-stat-label">种养品种</div>
                            </div>
                            <div class="wb-stat-item">
                                <div class="wb-stat-number">0个</div>
                                <div class="wb-stat-label">物联网设备</div>
                            </div>
                        </div>
                    </div>

                    <!-- 当前生产主体 -->
                    <div class="card subject-card">
                        <div class="subject-row">
                            <div class="subject-title">当前生产主体</div>
                            <a class="subject-switch" href="javascript:void(0)">切换 <i class="fas fa-arrow-right"></i></a>
                        </div>
                        <div class="subject-desc">大厅水培植物 | 一号分区</div>
                    </div>
                    
                    <!-- AI病虫害诊断卡片 -->
                    <div class="card ai-diagnosis-card">
                        <div class="ai-card-header">
                            <div class="ai-card-title">
                                <i class="fas fa-robot"></i>
                                <span>AI病虫害诊断</span>
                            </div>
                            <div class="ai-card-subtitle">智能识别 · 专家建议 · 精准防治</div>
                        </div>
                        
                        <div class="ai-card-content">
                            <div class="ai-description">
                                云农谷AI有强大的图片分析能力，帮您识别病虫害出防治方案，支持拍照识别，图片+文字同时提问。
                            </div>
                            
                            <!-- 组合式输入区域 - 图片上传嵌入文本输入框 -->
                            <div class="combined-input-container">
                                <textarea 
                                    id="inlineQuestionTextarea" 
                                    class="combined-textarea" 
                                    placeholder="告诉我您的问题吧～"
                                    rows="3"
                                ></textarea>
                                
                                <!-- 内嵌图片上传区域 -->
                                <div class="embedded-upload-area">
                                    <div class="embedded-upload-trigger" id="embeddedUploadTrigger">
                                        <i class="fas fa-image"></i>
                                        <span>添加图片</span>
                                    </div>
                                    <div class="embedded-image-preview" id="embeddedImagePreview">
                                        <!-- 内嵌图片预览 -->
                                    </div>
                                </div>
                                <input type="file" id="embeddedImageInput" accept="image/*" style="display: none;" multiple>
                            </div>
                            
                            <!-- AI诊断按钮 -->
                            <div class="ai-card-actions">
                                <button class="btn-start-ai-diagnosis" id="btnStartDiagnosis" onclick="startInlineDiagnosis()">
                                    <i class="fas fa-brain"></i>
                                    <span>开始AI诊断</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 农产品价格趋势卡片 -->
                    <div class="card price-trend-card" id="homePriceCard">
                        <!-- 地区切换公告提示 -->
                        <div class="price-region-notice" id="priceRegionNotice" style="display: none;">
                            <i class="fas fa-check-circle"></i>
                            <span id="priceRegionNoticeText"></span>
                            <button class="notice-view-btn" id="priceRegionNoticeBtn" onclick="viewNewRegionReport()">点击查看</button>
                        </div>
                        
                        <div onclick="enterPriceReport('小麦')">
                            <div class="price-card-header">
                                <div class="price-card-title">
                                    <i class="fas fa-chart-line"></i>
                                    <span>小麦价格行情</span>
                                </div>
                                <div class="price-card-subtitle">AI智能分析 · 点击查看详细报告</div>
                            </div>
                            
                            <div class="price-card-content">
                                <div class="price-main-info">
                                    <div class="price-product">
                                        <div class="product-name">小麦</div>
                                        <div class="product-region" id="homeProductRegion">河南地区</div>
                                    </div>
                                    <div class="price-value">
                                        <div class="price-current">¥2.65<span class="price-unit">/斤</span></div>
                                        <div class="price-change positive">
                                            <i class="fas fa-arrow-up"></i>
                                            <span>+0.08 (+3.1%)</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 微型趋势图 -->
                                <div class="price-sparkline">
                                    <canvas id="priceSparklineCanvas" width="300" height="60"></canvas>
                                </div>
                                
                                <!-- 一句话解盘 -->
                                <div class="price-insight">
                                    <i class="fas fa-lightbulb"></i>
                                    <span id="homePriceInsight">受雨雪影响，河南局部看涨</span>
                                </div>
                                
                                <div class="price-card-action">
                                    <div class="action-hint">
                                        <span>点击查看详细分析和预测</span>
                                        <i class="fas fa-chevron-right"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 切换地区按钮 -->
                        <div class="price-card-region-switch" onclick="event.stopPropagation(); showHomeRegionSelector('小麦')">
                            <i class="fas fa-map-marked-alt"></i>
                            <span>切换地区</span>
                        </div>
                    </div>

                    <!-- 数字大田功能入口 -->
                    <div class="card">
                        <div class="section-title">数字大田</div>
                        <div class="feature-grid">
                            <div class="feature-item clickable" onclick="loadPage('plantingPlan')"><div class="fi-icon"><i class="fas fa-seedling"></i></div><div class="fi-text">种植计划</div></div>
                            <div class="feature-item clickable" onclick="loadPage('farmCalendar')"><div class="fi-icon"><i class="fas fa-calendar-alt"></i></div><div class="fi-text">农事日历</div></div>
                            <div class="feature-item"><div class="fi-icon"><i class="fas fa-bug"></i></div><div class="fi-text">病虫害识别</div></div>
                            <div class="feature-item"><div class="fi-icon"><i class="fas fa-user-md"></i></div><div class="fi-text">专家诊断</div></div>
                            <div class="feature-item"><div class="fi-icon"><i class="fas fa-warehouse"></i></div><div class="fi-text">投入品管理</div></div>
                            <div class="feature-item"><div class="fi-icon"><i class="fas fa-file-signature"></i></div><div class="fi-text">投入品申请</div></div>
                            <div class="feature-item"><div class="fi-icon"><i class="fas fa-people-carry"></i></div><div class="fi-text">临时工申请</div></div>
                            <div class="feature-item"><div class="fi-icon"><i class="fas fa-stamp"></i></div><div class="fi-text">农事审批</div></div>
                            <div class="feature-item"><div class="fi-icon"><i class="fas fa-receipt"></i></div><div class="fi-text">我的领用</div></div>
                            <div class="feature-item"><div class="fi-icon"><i class="fas fa-tractor"></i></div><div class="fi-text">农机管理</div></div>
                            <div class="feature-item clickable" onclick="loadPage('fieldWorkstation')"><div class="fi-icon"><i class="fas fa-microchip"></i></div><div class="fi-text">田间工作站</div></div>
                            <div class="feature-item disabled"><div class="fi-icon"><i class="fas fa-ellipsis-h"></i></div><div class="fi-text">更多</div></div>
                        </div>
                    </div>
                </div>

                <!-- 底部导航 -->
                <div class="mobile-footer tabbar">
                    <div class="tab-item active" data-page="home"><i class="fas fa-home"></i><span>首页</span></div>
                    <div class="tab-item" data-page="mall"><i class="fas fa-store"></i><span>商城</span></div>
                    <div class="tab-item" data-page="ai"><i class="fas fa-robot"></i><span>AI</span></div>
                    <div class="tab-item" data-page="workbench"><i class="fas fa-briefcase"></i><span>工作台</span></div>
                    <div class="tab-item" data-page="profile"><i class="fas fa-user"></i><span>我的</span></div>
                </div>
            </div>
        `
    },
    
    // AI中心 - 中：AI对话（默认页）
    aiChatCenter: {
        title: 'AI对话',
        subtitle: '统一AI交互中心',
        content: `
            <div class="mobile-page ai-center-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('home')">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1 class="header-title-center">AI对话</h1>
                </div>
                <div class="mobile-content">
                    <!-- 历史记录按钮 -->
                    <div class="history-btn-container">
                        <button class="history-btn" onclick="showComingSoon('与现有功能保持一致')">
                            <i class="fas fa-history"></i>
                        </button>
                    </div>
                    <!-- AI Logo 和欢迎文字 -->
                    <div class="ai-welcome-section">
                        <div class="ai-logo">
                            <i class="fas fa-seedling"></i>
                        </div>
                        <p class="ai-greeting">您好，我是小跃，是您身边基于云农谷自研大模型的AI农业专家，您可以问我任何有关农业领域的问题......</p>
                        <button class="examples-btn" onclick="showExamplesModal()">
                            <i class="fas fa-lightbulb"></i>
                            <span>例子</span>
                        </button>
                    </div>

                    <!-- 输入区域 -->
                    <div class="ai-input-section">
                        <div class="ai-input-container">
                            <textarea id="aiCenterInput" class="ai-textarea" placeholder="输入您的问题，例如：这张叶片是什么病？" rows="5"></textarea>
                            <div class="ai-input-actions">
                                <button class="voice-btn" onclick="showComingSoon('语音录入')">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <button class="camera-btn" onclick="document.getElementById('aiCenterImage').click()">
                                    <i class="fas fa-camera"></i>
                                </button>
                                <button class="send-btn" onclick="startAICenterChat()">
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                            <input type="file" id="aiCenterImage" accept="image/*" multiple style="display:none" onchange="previewAICenterImages(this)">
                        </div>
                        <div id="aiCenterImagePreview" class="image-preview"></div>
                    </div>

                    <!-- 推荐智能体 -->
                    <div class="recommended-agents">
                        <div class="agents-hint">快速访问</div>
                        <div class="agents-grid agents-scroll">
                            <div class="agent-card" onclick="enterPriceAgent('小麦')">
                                <i class="fas fa-wheat-awn"></i>
                                <span>小麦价格智能体</span>
                            </div>
                            <div class="agent-card" onclick="loadWeatherDisasterHome()">
                                <i class="fas fa-cloud-sun-rain"></i>
                                <span>气象灾害预警</span>
                            </div>
                            <div class="agent-card" onclick="loadWeatherDisasterAgent()">
                                <i class="fas fa-map-marked-alt"></i>
                                <span>地块灾害预警</span>
                            </div>
                            <div class="agent-card" onclick="loadAgentChatPage('weed-control-analysis', '除草成效分析')">
                                <i class="fas fa-spray-can"></i>
                                <span>除草成效分析</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI中心内嵌三段式导航 -->
                <div class="mobile-footer ai-center-tabbar">
                    <div class="tab-item" data-ai-tab="agentMarket" onclick="loadPage('agentMarket')"><i class="fas fa-th-large"></i><span>智能体广场</span></div>
                    <div class="tab-item active" data-ai-tab="aiChatCenter" onclick="loadPage('aiChatCenter')"><i class="fas fa-comments"></i><span>AI对话</span></div>
                    <div class="tab-item" data-ai-tab="mySubscriptions" onclick="loadPage('mySubscriptions')"><i class="fas fa-star"></i><span>我的订阅</span></div>
                </div>

                <!-- 例子弹窗 -->
                <div id="examplesModal" class="examples-modal">
                    <div class="modal-overlay" onclick="hideExamplesModal()"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>常见问题示例</h3>
                            <button class="close-btn" onclick="hideExamplesModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="example-item" onclick="selectExample('如何防治小麦赤霉病？')">
                                <div class="example-title">病虫害防治</div>
                                <div class="example-desc">如何防治小麦赤霉病？</div>
                            </div>
                            <div class="example-item" onclick="selectExample('玉米施肥的最佳时间是什么时候？')">
                                <div class="example-title">施肥管理</div>
                                <div class="example-desc">玉米施肥的最佳时间是什么时候？</div>
                            </div>
                            <div class="example-item" onclick="selectExample('如何提高水稻产量？')">
                                <div class="example-title">产量提升</div>
                                <div class="example-desc">如何提高水稻产量？</div>
                            </div>
                            <div class="example-item" onclick="selectExample('最近的天气对作物有什么影响？')">
                                <div class="example-title">气象影响</div>
                                <div class="example-desc">最近的天气对作物有什么影响？</div>
                            </div>
                            <div class="example-item" onclick="selectExample('什么是数字大田？')">
                                <div class="example-title">数字农业</div>
                                <div class="example-desc">什么是数字大田？</div>
                            </div>
                            <div class="example-item" onclick="selectExample('如何进行土壤检测？')">
                                <div class="example-title">土壤管理</div>
                                <div class="example-desc">如何进行土壤检测？</div>
                            </div>
                            <div class="example-item" onclick="selectExample('如何选择适合的种子？')">
                                <div class="example-title">种子选择</div>
                                <div class="example-desc">如何选择适合的种子？</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },

    // 新增：病虫害识别页面
    pestDetect: {
        title: '病虫害识别',
        subtitle: '拍照或描述，AI识别病虫害',
        content: `
            <div class="mobile-page ai-center-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('aiChatCenter')">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1>病虫害识别</h1>
                </div>
                <div class="mobile-content">
                    <!-- 顶部说明 -->
                    <div class="ai-welcome-section">
                        <div class="ai-logo">
                            <i class="fas fa-bug"></i>
                        </div>
                        <p class="ai-greeting">上传或拍摄病叶/虫体照片，或用文字描述症状，我来帮您识别并给出治理建议。</p>
                        <button class="examples-btn" onclick="showExamplesModal()">
                            <i class="fas fa-lightbulb"></i>
                            <span>例子</span>
                        </button>
                    </div>

                    <!-- 输入区域（复用AI中心的ID，避免新增JS） -->
                    <div class="ai-input-section">
                        <div class="ai-input-container">
                            <textarea id="aiCenterInput" class="ai-textarea" placeholder="例如：这张叶片有黄褐色斑点，请问是什么病？" rows="5"></textarea>
                            <div class="ai-input-actions">
                                <button class="voice-btn" onclick="showComingSoon('语音录入')">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <button class="camera-btn" onclick="document.getElementById('aiCenterImage').click()">
                                    <i class="fas fa-camera"></i>
                                </button>
                                <button class="send-btn" onclick="startAICenterChat()">
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                            <input type="file" id="aiCenterImage" accept="image/*" multiple style="display:none" onchange="previewAICenterImages(this)">
                        </div>
                        <div id="aiCenterImagePreview" class="image-preview"></div>
                    </div>

                    <!-- 例子弹窗（复用通用结构与JS） -->
                    <div id="examplesModal" class="examples-modal">
                        <div class="modal-overlay" onclick="hideExamplesModal()"></div>
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3>常见识别示例</h3>
                                <button class="close-btn" onclick="hideExamplesModal()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="example-item" onclick="selectExample('这张叶片是否为玉米大斑病？')">
                                    <div class="example-title">图片识别</div>
                                    <div class="example-desc">这张叶片是否为玉米大斑病？</div>
                                </div>
                                <div class="example-item" onclick="selectExample('小麦叶片出现条状黄化是什么原因？')">
                                    <div class="example-title">症状描述</div>
                                    <div class="example-desc">小麦叶片出现条状黄化是什么原因？</div>
                                </div>
                                <div class="example-item" onclick="selectExample('番茄叶背有白色小虫如何治理？')">
                                    <div class="example-title">虫害识别</div>
                                    <div class="example-desc">番茄叶背有白色小虫如何治理？</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 保持AI三段式（仅显示三项，无底部五项导航） -->
                <div class="mobile-footer ai-center-tabbar">
                    <div class="tab-item" data-ai-tab="agentMarket" onclick="loadPage('agentMarket')"><i class="fas fa-th-large"></i><span>智能体广场</span></div>
                    <div class="tab-item active" data-ai-tab="aiChatCenter" onclick="loadPage('pestDetect')"><i class="fas fa-bug"></i><span>病虫害识别</span></div>
                    <div class="tab-item" data-ai-tab="mySubscriptions" onclick="loadPage('mySubscriptions')"><i class="fas fa-star"></i><span>我的订阅</span></div>
                </div>
            </div>
        `
    },

    // AI中心 - 左：智能体广场
    agentMarket: {
        title: '智能体广场',
        subtitle: '发现与订阅',
        content: `
            <div class="mobile-page agent-market-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('aiChatCenter')">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1>智能体广场</h1>
                </div>
                <div class="mobile-content">
                    <div class="search-bar"><i class="fas fa-search"></i><input type="text" placeholder="搜索智能体，如 病虫害、产量" oninput="showComingSoon('搜索')"></div>

                    <!-- 分类卡片：灾害预警 -->
                    <div class="category-section">
                        <div class="category-title">灾害预警</div>
                        <div class="agent-cards-grid">
                            <div class="agent-card-detailed" data-agent-id="weather-disaster" data-category="灾害预警" data-type="platform" data-price="free" onclick="handleAgentCardClick(event, 'weather-disaster', 'free')">
                                <div class="agent-icon"><i class="fas fa-cloud-sun-rain"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">气象灾害预警</div>
                                    <div class="agent-desc">地块级气象预警，智能农事决策</div>
                                    <div class="agent-tags">
                                        <span class="tag platform-tag">平台官方</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('weather-disaster', 'free')">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="risk-analysis" data-category="灾害预警" data-type="platform" data-price="free" onclick="handleAgentCardClick(event, 'risk-analysis', 'free')">
                                <div class="agent-icon"><i class="fas fa-exclamation-triangle"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">风险分析</div>
                                    <div class="agent-desc">智能分析农业风险，提前预警</div>
                                    <div class="agent-tags">
                                        <span class="tag platform-tag">平台官方</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('risk-analysis', 'free')">订阅</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 分类卡片：价格行情 -->
                    <div class="category-section">
                        <div class="category-title">价格行情</div>
                        <div class="agent-cards-grid">
                            <div class="agent-card-detailed" data-agent-id="wheat-price" data-category="价格行情" data-type="platform" data-price="free" onclick="enterPriceAgent('小麦')">
                                <div class="agent-icon"><i class="fas fa-seedling"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">小麦价格智能体</div>
                                    <div class="agent-desc">实时价格、趋势预测、决策建议</div>
                                    <div class="agent-tags">
                                        <span class="tag platform-tag">平台官方</span>
                                        <span class="tag hot-tag">热门</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn subscribed" onclick="event.stopPropagation();">已订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="corn-price" data-category="价格行情" data-type="platform" data-price="free" onclick="enterPriceAgent('玉米')">
                                <div class="agent-icon"><i class="fas fa-corn"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">玉米价格智能体</div>
                                    <div class="agent-desc">实时价格、趋势预测、决策建议</div>
                                    <div class="agent-tags">
                                        <span class="tag platform-tag">平台官方</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('corn-price', 'free')">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="soy-price" data-category="价格行情" data-type="platform" data-price="free" onclick="enterPriceAgent('大豆')">
                                <div class="agent-icon"><i class="fas fa-leaf"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">大豆价格智能体</div>
                                    <div class="agent-desc">实时价格、趋势预测、决策建议</div>
                                    <div class="agent-tags">
                                        <span class="tag platform-tag">平台官方</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('soy-price', 'free')">订阅</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 分类卡片：农事管理 -->
                    <div class="category-section">
                        <div class="category-title">农事管理</div>
                        <div class="agent-cards-grid">
                            <div class="agent-card-detailed" data-agent-id="digital-farmland" data-category="农事管理" data-type="platform" data-price="free" onclick="handleAgentCardClick(event, 'digital-farmland', 'free')">
                                <div class="agent-icon"><i class="fas fa-seedling"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">数字大田</div>
                                    <div class="agent-desc">智能农田管理，精准农事指导</div>
                                    <div class="agent-tags">
                                        <span class="tag platform-tag">平台官方</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('digital-farmland', 'free');">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="statistical-analysis" data-category="农事管理" data-type="platform" data-price="free" onclick="handleAgentCardClick(event, 'statistical-analysis', 'free')">
                                <div class="agent-icon"><i class="fas fa-chart-pie"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">统计分析</div>
                                    <div class="agent-desc">农事数据统计分析，决策支持</div>
                                    <div class="agent-tags">
                                        <span class="tag platform-tag">平台官方</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('statistical-analysis', 'free')">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="weed-control-analysis" data-category="农事管理" data-type="platform" data-price="free" onclick="handleAgentCardClick(event, 'weed-control-analysis', 'free')">
                                <div class="agent-icon"><i class="fas fa-spray-can"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">除草成效分析</div>
                                    <div class="agent-desc">智能分析除草效果，优化方案</div>
                                    <div class="agent-tags">
                                        <span class="tag platform-tag">平台官方</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('weed-control-analysis', 'free')">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="plan-assistant" data-category="农事管理" data-type="expert" data-expert="张惠农" data-price="paid" onclick="handleAgentCardClick(event, 'plan-assistant', 'paid')">
                                <div class="agent-icon"><i class="fas fa-calendar-alt"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">生产计划助手</div>
                                    <div class="agent-desc">智能制定农事计划</div>
                                    <div class="agent-tags">
                                        <span class="tag expert-tag">张惠农</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price paid">¥29/月</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('plan-assistant', 'paid')">订阅</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 分类卡片：病虫害防治 -->
                    <div class="category-section">
                        <div class="category-title">病虫害防治</div>
                        <div class="agent-cards-grid">
                            <div class="agent-card-detailed" data-agent-id="pest-diagnosis" data-category="病虫害防治" data-type="platform" data-price="free">
                                <div class="agent-icon"><i class="fas fa-bug"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">病虫害诊断</div>
                                    <div class="agent-desc">AI智能识别病虫害，精准诊断</div>
                                    <div class="agent-tags">
                                        <span class="tag platform-tag">平台官方</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('pest-diagnosis', 'free')">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="pesticide-advisor" data-category="病虫害防治" data-type="expert" data-expert="李植保" data-price="paid">
                                <div class="agent-icon"><i class="fas fa-pills"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">用药建议</div>
                                    <div class="agent-desc">精准用药指导，科学防治</div>
                                    <div class="agent-tags">
                                        <span class="tag expert-tag">李植保</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price paid">¥39/月</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('pesticide-advisor', 'paid')">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="expert-weekly" data-category="病虫害防治" data-type="expert" data-expert="王农技" data-price="paid">
                                <div class="agent-icon"><i class="fas fa-newspaper"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">专家周报</div>
                                    <div class="agent-desc">每周病虫害预警，及时防治</div>
                                    <div class="agent-tags">
                                        <span class="tag expert-tag">王农技</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price paid">¥19/月</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('expert-weekly', 'paid')">订阅</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 分类卡片：作物生长管理 -->
                    <div class="category-section">
                        <div class="category-title">作物生长管理</div>
                        <div class="agent-cards-grid">
                            <div class="agent-card-detailed" data-agent-id="crop-model-brain" data-category="作物生长管理" data-type="platform" data-price="free">
                                <div class="agent-icon"><i class="fas fa-brain"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">农作物模型大脑</div>
                                    <div class="agent-desc">智能作物生长模型，精准管理</div>
                                    <div class="agent-tags">
                                        <span class="tag platform-tag">平台官方</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('crop-model-brain', 'free')">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="growth-stage" data-category="作物生长管理" data-type="expert" data-expert="陈农学" data-price="free">
                                <div class="agent-icon"><i class="fas fa-seedling"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">生育期识别</div>
                                    <div class="agent-desc">智能识别作物生长阶段</div>
                                    <div class="agent-tags">
                                        <span class="tag expert-tag">陈农学</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('growth-stage', 'free')">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="nutrition-advisor" data-category="作物生长管理" data-type="expert" data-expert="刘营养" data-price="paid">
                                <div class="agent-icon"><i class="fas fa-flask"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">营养诊断</div>
                                    <div class="agent-desc">精准营养分析，科学施肥</div>
                                    <div class="agent-tags">
                                        <span class="tag expert-tag">刘营养</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price paid">¥49/月</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('nutrition-advisor', 'paid')">订阅</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 分类卡片：销售服务 -->
                    <div class="category-section">
                        <div class="category-title">销售服务</div>
                        <div class="agent-cards-grid">
                            <div class="agent-card-detailed" data-agent-id="price-insight" data-category="销售服务" data-type="expert" data-expert="赵市场" data-price="free">
                                <div class="agent-icon"><i class="fas fa-chart-bar"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">价格洞察</div>
                                    <div class="agent-desc">市场行情分析，价格预测</div>
                                    <div class="agent-tags">
                                        <span class="tag expert-tag">赵市场</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('price-insight', 'free')">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="channel-match" data-category="销售服务" data-type="expert" data-expert="孙销售" data-price="paid">
                                <div class="agent-icon"><i class="fas fa-handshake"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">渠道匹配</div>
                                    <div class="agent-desc">智能匹配销售渠道</div>
                                    <div class="agent-tags">
                                        <span class="tag expert-tag">孙销售</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price paid">¥59/月</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('channel-match', 'paid')">订阅</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 分类卡片：选种服务 -->
                    <div class="category-section">
                        <div class="category-title">选种服务</div>
                        <div class="agent-cards-grid">
                            <div class="agent-card-detailed" data-agent-id="variety-select" data-category="选种服务" data-type="expert" data-expert="周育种" data-price="free">
                                <div class="agent-icon"><i class="fas fa-seedling"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">品种选择</div>
                                    <div class="agent-desc">智能推荐优质品种</div>
                                    <div class="agent-tags">
                                        <span class="tag expert-tag">周育种</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('variety-select', 'free')">订阅</button>
                                </div>
                            </div>
                            <div class="agent-card-detailed" data-agent-id="seed-plan" data-category="选种服务" data-type="expert" data-expert="吴种植" data-price="paid">
                                <div class="agent-icon"><i class="fas fa-calendar-check"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">播种计划</div>
                                    <div class="agent-desc">科学制定播种方案</div>
                                    <div class="agent-tags">
                                        <span class="tag expert-tag">吴种植</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price paid">¥29/月</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('seed-plan', 'paid')">订阅</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 分类卡片：其他 -->
                    <div class="category-section">
                        <div class="category-title">其他</div>
                        <div class="agent-cards-grid">
                            <div class="agent-card-detailed" data-agent-id="policy-advisor" data-category="其他" data-type="expert" data-expert="钱政策" data-price="free">
                                <div class="agent-icon"><i class="fas fa-book"></i></div>
                                <div class="agent-info">
                                    <div class="agent-name">政策咨询</div>
                                    <div class="agent-desc">农业政策解读指导</div>
                                    <div class="agent-tags">
                                        <span class="tag expert-tag">钱政策</span>
                                    </div>
                                </div>
                                <div class="agent-actions">
                                    <div class="agent-price free">免费</div>
                                    <button class="subscribe-btn" onclick="event.stopPropagation(); subscribeAgent('policy-advisor', 'free')">订阅</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mobile-footer ai-center-tabbar">
                    <div class="tab-item active" data-ai-tab="agentMarket" onclick="loadPage('agentMarket')"><i class="fas fa-th-large"></i><span>智能体广场</span></div>
                    <div class="tab-item" data-ai-tab="aiChatCenter" onclick="loadPage('aiChatCenter')"><i class="fas fa-comments"></i><span>AI对话</span></div>
                    <div class="tab-item" data-ai-tab="mySubscriptions" onclick="loadPage('mySubscriptions')"><i class="fas fa-star"></i><span>我的订阅</span></div>
                </div>
            </div>
        `
    },

    // AI中心 - 右：我的订阅
    mySubscriptions: {
        title: '我的订阅',
        subtitle: '已购智能体管理',
        content: `
            <div class="mobile-page my-subs-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('aiChatCenter')">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1>我的订阅</h1>
                    <button class="demo-toggle-btn" onclick="toggleSubscriptionDemo()" title="切换演示状态">
                        <i class="fas fa-toggle-on"></i>
                    </button>
                </div>
                <div class="mobile-content">
                    <!-- 未订阅状态 -->
                    <div class="empty-state" id="subsEmpty">
                        <div class="empty-icon"><i class="fas fa-box-open"></i></div>
                        <div class="empty-title">还没有订阅</div>
                        <div class="empty-sub">去智能体广场发现更多能力</div>
                        <div style="text-align:center; margin-top:8px;">
                            <button class="btn-secondary" onclick="loadPage('agentMarket')">去逛逛</button>
                        </div>
                    </div>

                    <!-- 已订阅状态 -->
                    <div class="subscription-content" id="subsContent" style="display:none">
                        <!-- 订阅统计 -->
                        <div class="subscription-stats">
                            <div class="stat-item">
                                <div class="stat-number">6</div>
                                <div class="stat-label">已订阅</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">4</div>
                                <div class="stat-label">免费</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">2</div>
                                <div class="stat-label">付费</div>
                            </div>
                        </div>

                        <!-- 订阅列表 -->
                        <div class="subscription-list">
                            <div class="list-section-title">我的智能体</div>
                            
                            <!-- 免费订阅 -->
                            <div class="subscription-item" onclick="enterPriceAgent('小麦')">
                                <div class="sub-icon"><i class="fas fa-seedling"></i></div>
                                <div class="sub-info">
                                    <div class="sub-name">小麦价格智能体</div>
                                    <div class="sub-desc">实时价格、趋势预测、决策建议</div>
                                    <div class="sub-status free">永久免费</div>
                                </div>
                                <div class="sub-action">
                                    <span class="action-btn">使用</span>
                                </div>
                            </div>
                            
                            <div class="subscription-item" onclick="loadPage('pestDetect')">
                                <div class="sub-icon"><i class="fas fa-bug"></i></div>
                                <div class="sub-info">
                                    <div class="sub-name">病虫害识别</div>
                                    <div class="sub-desc">AI智能识别病虫害</div>
                                    <div class="sub-status free">永久免费</div>
                                </div>
                                <div class="sub-action">
                                    <span class="action-btn">使用</span>
                                </div>
                            </div>

                            <div class="subscription-item" onclick="openAgentDetail('plan-assistant')">
                                <div class="sub-icon"><i class="fas fa-calendar-alt"></i></div>
                                <div class="sub-info">
                                    <div class="sub-name">生产计划助手</div>
                                    <div class="sub-desc">智能制定农事计划</div>
                                    <div class="sub-status free">永久免费</div>
                                </div>
                                <div class="sub-action">
                                    <span class="action-btn">使用</span>
                                </div>
                            </div>

                            <div class="subscription-item" onclick="openAgentDetail('growth-stage')">
                                <div class="sub-icon"><i class="fas fa-seedling"></i></div>
                                <div class="sub-info">
                                    <div class="sub-name">生育期识别</div>
                                    <div class="sub-desc">智能识别作物生长阶段</div>
                                    <div class="sub-status free">永久免费</div>
                                </div>
                                <div class="sub-action">
                                    <span class="action-btn">使用</span>
                                </div>
                            </div>

                            <!-- 付费订阅 -->
                            <div class="subscription-item">
                                <div class="sub-icon"><i class="fas fa-pills"></i></div>
                                <div class="sub-info">
                                    <div class="sub-name">用药建议</div>
                                    <div class="sub-desc">精准用药指导</div>
                                    <div class="sub-status paid">¥2/次 · 剩余15次</div>
                                </div>
                                <div class="sub-actions">
                                    <span class="action-btn primary" onclick="openAgentDetail('pesticide-advisor')">使用</span>
                                    <span class="action-btn secondary" onclick="showRenewalModal('pesticide-advisor')">续费</span>
                                </div>
                            </div>

                            <div class="subscription-item">
                                <div class="sub-icon"><i class="fas fa-chart-line"></i></div>
                                <div class="sub-info">
                                    <div class="sub-name">产量预测</div>
                                    <div class="sub-desc">AI预测作物产量</div>
                                    <div class="sub-status paid">¥5/次 · 剩余8次</div>
                                </div>
                                <div class="sub-actions">
                                    <span class="action-btn primary" onclick="openAgentDetail('yield-forecast')">使用</span>
                                    <span class="action-btn secondary" onclick="showRenewalModal('yield-forecast')">续费</span>
                                </div>
                            </div>
                        </div>

                        <!-- 管理操作 -->
                        <div class="subscription-actions">
                            <button class="btn-primary" onclick="loadPage('agentMarket')">
                                <i class="fas fa-plus"></i> 发现更多智能体
                            </button>
                        </div>
                    </div>

                    <!-- 续费弹窗 -->
                    <div id="renewalModal" class="modal-overlay" style="display:none" onclick="hideRenewalModal()">
                        <div class="modal-content" onclick="event.stopPropagation()">
                            <div class="modal-header">
                                <h3>续费智能体</h3>
                                <button class="modal-close" onclick="hideRenewalModal()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="renewal-info">
                                    <div class="agent-info">
                                        <div class="agent-icon" id="renewalAgentIcon"><i class="fas fa-robot"></i></div>
                                        <div class="agent-details">
                                            <div class="agent-name" id="renewalAgentName">智能体名称</div>
                                            <div class="agent-desc" id="renewalAgentDesc">智能体描述</div>
                                        </div>
                                    </div>
                                    <div class="current-status">
                                        <span class="status-label">当前状态：</span>
                                        <span class="status-value" id="renewalCurrentStatus">剩余15次</span>
                                    </div>
                                </div>
                                <div class="renewal-options">
                                    <div class="option-title">选择续费方案</div>
                                    <div class="option-item" data-count="10" data-price="20">
                                        <div class="option-info">
                                            <div class="option-count">10次</div>
                                            <div class="option-price">¥20</div>
                                        </div>
                                        <div class="option-select">
                                            <input type="radio" name="renewalOption" value="10" checked>
                                        </div>
                                    </div>
                                    <div class="option-item" data-count="30" data-price="50">
                                        <div class="option-info">
                                            <div class="option-count">30次</div>
                                            <div class="option-price">¥50</div>
                                            <div class="option-discount">省¥10</div>
                                        </div>
                                        <div class="option-select">
                                            <input type="radio" name="renewalOption" value="30">
                                        </div>
                                    </div>
                                    <div class="option-item" data-count="100" data-price="150">
                                        <div class="option-info">
                                            <div class="option-count">100次</div>
                                            <div class="option-price">¥150</div>
                                            <div class="option-discount">省¥50</div>
                                        </div>
                                        <div class="option-select">
                                            <input type="radio" name="renewalOption" value="100">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button class="btn-secondary" onclick="hideRenewalModal()">取消</button>
                                <button class="btn-primary" onclick="confirmRenewal()">确认续费</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mobile-footer ai-center-tabbar">
                    <div class="tab-item" data-ai-tab="agentMarket" onclick="loadPage('agentMarket')"><i class="fas fa-th-large"></i><span>智能体广场</span></div>
                    <div class="tab-item" data-ai-tab="aiChatCenter" onclick="loadPage('aiChatCenter')"><i class="fas fa-comments"></i><span>AI对话</span></div>
                    <div class="tab-item active" data-ai-tab="mySubscriptions" onclick="loadPage('mySubscriptions')"><i class="fas fa-star"></i><span>我的订阅</span></div>
                </div>
            </div>
        `
    },
    
    // 小麦价格智能体页面（主页模式）
    wheatPriceAgent: {
        title: '小麦价格智能体',
        subtitle: '实时行情·智能预测·决策建议',
        content: `
            <div class="mobile-page price-agent-home-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('home')">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1>小麦价格智能体</h1>
                </div>
                <div class="mobile-content price-home-content">
                    <!-- 历史记录按钮 -->
                    <div class="history-btn-container">
                        <button class="history-btn" onclick="showComingSoon('历史记录')">
                            <i class="fas fa-history"></i>
                        </button>
                    </div>
                    
                    <!-- AI Logo 和欢迎文字 -->
                    <div class="ai-welcome-section">
                        <div class="ai-logo price-logo">
                            <i class="fas fa-wheat-awn"></i>
                        </div>
                        <p class="ai-greeting">您好！我是小麦价格智能体，为您提供实时价格查询、趋势预测和决策建议......</p>
                        <button class="examples-btn" onclick="showPriceExamplesModal('小麦')">
                            <i class="fas fa-lightbulb"></i>
                            <span>例子</span>
                        </button>
                    </div>

                    <!-- 输入区域 -->
                    <div class="ai-input-section">
                        <div class="ai-input-container">
                            <textarea id="priceHomeInput" class="ai-textarea" placeholder="输入您的问题，例如：今天郑州小麦多少钱一斤？" rows="5"></textarea>
                            <div class="ai-input-actions">
                                <button class="voice-btn" onclick="showComingSoon('语音录入')">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <button class="camera-btn" onclick="showComingSoon('拍照')">
                                    <i class="fas fa-camera"></i>
                                </button>
                                <button class="send-btn" onclick="startPriceHomeChat('小麦')">
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 快速访问 -->
                    <div class="recommended-agents price-quick-access">
                        <div class="agents-hint">快速访问</div>
                        <div class="agents-grid">
                            <div class="agent-card" onclick="loadWeatherDisasterHome()">
                                <i class="fas fa-cloud-sun-rain"></i>
                                <span>气象灾害预警</span>
                            </div>
                            <div class="agent-card" onclick="loadPage('pestDetect')">
                                <i class="fas fa-bug"></i>
                                <span>病虫害诊断</span>
                            </div>
                            <div class="agent-card" onclick="loadAgentChatPage('weed-control-analysis', '除草成效分析')">
                                <i class="fas fa-spray-can"></i>
                                <span>化学除草分析</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    // 玉米价格智能体
    cornPriceAgent: {
        title: '玉米价格智能体',
        subtitle: '实时行情·智能预测·决策建议',
        content: `
            <div class="mobile-page price-agent-home-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('home')">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1>玉米价格智能体</h1>
                </div>
                <div class="mobile-content price-home-content">
                    <!-- 历史记录按钮 -->
                    <div class="history-btn-container">
                        <button class="history-btn" onclick="showComingSoon('历史记录')">
                            <i class="fas fa-history"></i>
                        </button>
                    </div>
                    
                    <!-- AI Logo 和欢迎文字 -->
                    <div class="ai-welcome-section">
                        <div class="ai-logo price-logo">
                            <i class="fas fa-corn"></i>
                        </div>
                        <p class="ai-greeting">您好！我是玉米价格智能体，为您提供实时价格查询、趋势预测和决策建议......</p>
                        <button class="examples-btn" onclick="showPriceExamplesModal('玉米')">
                            <i class="fas fa-lightbulb"></i>
                            <span>例子</span>
                        </button>
                    </div>

                    <!-- 输入区域 -->
                    <div class="ai-input-section">
                        <div class="ai-input-container">
                            <textarea id="priceHomeInput" class="ai-textarea" placeholder="输入您的问题，例如：今天吉林玉米多少钱一斤？" rows="5"></textarea>
                            <div class="ai-input-actions">
                                <button class="voice-btn" onclick="showComingSoon('语音录入')">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <button class="camera-btn" onclick="showComingSoon('拍照')">
                                    <i class="fas fa-camera"></i>
                                </button>
                                <button class="send-btn" onclick="startPriceHomeChat('玉米')">
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 快速访问 -->
                    <div class="recommended-agents price-quick-access">
                        <div class="agents-hint">快速访问</div>
                        <div class="agents-grid">
                            <div class="agent-card" onclick="loadWeatherDisasterHome()">
                                <i class="fas fa-cloud-sun-rain"></i>
                                <span>气象灾害预警</span>
                            </div>
                            <div class="agent-card" onclick="loadPage('pestDetect')">
                                <i class="fas fa-bug"></i>
                                <span>病虫害诊断</span>
                            </div>
                            <div class="agent-card" onclick="loadAgentChatPage('weed-control-analysis', '除草成效分析')">
                                <i class="fas fa-spray-can"></i>
                                <span>化学除草分析</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    // 大豆价格智能体
    soyPriceAgent: {
        title: '大豆价格智能体',
        subtitle: '实时行情·智能预测·决策建议',
        content: `
            <div class="mobile-page price-agent-home-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('home')">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1>大豆价格智能体</h1>
                </div>
                <div class="mobile-content price-home-content">
                    <!-- 历史记录按钮 -->
                    <div class="history-btn-container">
                        <button class="history-btn" onclick="showComingSoon('历史记录')">
                            <i class="fas fa-history"></i>
                        </button>
                    </div>
                    
                    <!-- AI Logo 和欢迎文字 -->
                    <div class="ai-welcome-section">
                        <div class="ai-logo price-logo">
                            <i class="fas fa-seedling"></i>
                        </div>
                        <p class="ai-greeting">您好！我是大豆价格智能体，为您提供实时价格查询、趋势预测和决策建议......</p>
                        <button class="examples-btn" onclick="showPriceExamplesModal('大豆')">
                            <i class="fas fa-lightbulb"></i>
                            <span>例子</span>
                        </button>
                    </div>

                    <!-- 输入区域 -->
                    <div class="ai-input-section">
                        <div class="ai-input-container">
                            <textarea id="priceHomeInput" class="ai-textarea" placeholder="输入您的问题，例如：今天黑龙江大豆多少钱一斤？" rows="5"></textarea>
                            <div class="ai-input-actions">
                                <button class="voice-btn" onclick="showComingSoon('语音录入')">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <button class="camera-btn" onclick="showComingSoon('拍照')">
                                    <i class="fas fa-camera"></i>
                                </button>
                                <button class="send-btn" onclick="startPriceHomeChat('大豆')">
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 快速访问 -->
                    <div class="recommended-agents price-quick-access">
                        <div class="agents-hint">快速访问</div>
                        <div class="agents-grid">
                            <div class="agent-card" onclick="loadWeatherDisasterHome()">
                                <i class="fas fa-cloud-sun-rain"></i>
                                <span>气象灾害预警</span>
                            </div>
                            <div class="agent-card" onclick="loadPage('pestDetect')">
                                <i class="fas fa-bug"></i>
                                <span>病虫害诊断</span>
                            </div>
                            <div class="agent-card" onclick="loadAgentChatPage('weed-control-analysis', '除草成效分析')">
                                <i class="fas fa-spray-can"></i>
                                <span>化学除草分析</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    // 首页价格报告页面（带预览卡片）
    homePriceReport: {
        title: '小麦价格报告',
        subtitle: '',
        content: `
            <div class="mobile-page home-price-report-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="header-title">
                        <h1 id="homePriceReportTitle">小麦价格报告</h1>
                    </div>
                </div>
                <div class="home-price-report-content" id="homePriceReportContent">
                    <!-- 内容将通过JavaScript动态生成 -->
                </div>
            </div>
        `
    },
    
    // 价格AI分析报告详情页面
    priceReport: {
        title: '价格AI分析报告',
        subtitle: '',
        content: `
            <div class="mobile-page price-report-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="header-title">
                        <h1 id="priceReportTitle">价格AI分析报告</h1>
                    </div>
                    <button class="share-btn" id="priceReportShareBtn" onclick="sharePriceReport()" style="display:none;">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
                <div class="price-report-content" id="priceReportContent">
                    <!-- 内容将通过JavaScript动态生成 -->
                </div>
            </div>
        `
    },

    // 价格对话页面
    priceChat: {
        title: '价格智能体对话',
        subtitle: '',
        content: `
            <div class="mobile-page price-chat-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBackToPriceHome()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="header-title">
                        <h1 id="priceChatTitle">小麦价格智能体</h1>
                    </div>
                </div>
                <div class="mobile-content price-chat-content">
                    <div class="price-chat-messages" id="priceChatMessages">
                        <!-- 消息将在这里显示 -->
                    </div>
                </div>
                <div class="price-chat-input">
                    <input type="text" id="priceChatInput" placeholder="输入您的问题..." />
                    <button class="send-btn" onclick="sendPriceChatMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `
    },

    // 历史价格查询页面
    priceQuery: {
        title: '历史价格查询',
        subtitle: '',
        content: `
            <div class="mobile-page price-query-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBackToPriceHome()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="header-title">
                        <h1 id="priceQueryTitle">小麦历史价格查询</h1>
                    </div>
                </div>
                <div class="mobile-content price-query-content">
                    <!-- 查询表单 -->
                    <div class="query-form-section">
                        <h3><i class="fas fa-search"></i> 查询条件</h3>
                        
                        <div class="form-group">
                            <label class="form-label">地区选择</label>
                            <div class="cascader-container">
                                <select id="provinceSelect" class="form-select" onchange="updateCityOptions()">
                                    <option value="">选择省份</option>
                                    <option value="河南省">河南省</option>
                                    <option value="山东省">山东省</option>
                                    <option value="河北省">河北省</option>
                                </select>
                                <select id="citySelect" class="form-select" onchange="updateCountyOptions()">
                                    <option value="">选择城市</option>
                                </select>
                                <select id="countySelect" class="form-select">
                                    <option value="">选择区县</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">查询类型</label>
                            <div class="query-type-tabs">
                                <button class="query-type-tab active" data-type="single" onclick="switchQueryType('single')">
                                    单年查询
                                </button>
                                <button class="query-type-tab" data-type="trend" onclick="switchQueryType('trend')">
                                    趋势分析
                                </button>
                            </div>
                        </div>

                        <!-- 单年查询表单 -->
                        <div id="singleQueryForm" class="query-form-item active">
                            <div class="form-group">
                                <label class="form-label">选择年份</label>
                                <select id="yearSelect" class="form-select">
                                    <option value="">选择年份</option>
                                    <option value="2025">2025年</option>
                                    <option value="2024">2024年</option>
                                    <option value="2023">2023年</option>
                                    <option value="2022">2022年</option>
                                    <option value="2021">2021年</option>
                                    <option value="2020">2020年</option>
                                    <option value="2019">2019年</option>
                                    <option value="2018">2018年</option>
                                    <option value="2017">2017年</option>
                                    <option value="2016">2016年</option>
                                    <option value="2015">2015年</option>
                                    <option value="2014">2014年</option>
                                    <option value="2013">2013年</option>
                                    <option value="2012">2012年</option>
                                    <option value="2011">2011年</option>
                                    <option value="2010">2010年</option>
                                    <option value="2009">2009年</option>
                                </select>
                            </div>
                        </div>

                        <!-- 趋势分析表单 -->
                        <div id="trendQueryForm" class="query-form-item">
                            <div class="form-group">
                                <label class="form-label">年份范围</label>
                                <div class="year-range-container">
                                    <select id="startYearSelect" class="form-select">
                                        <option value="">起始年份</option>
                                        <option value="2009">2009年</option>
                                        <option value="2010">2010年</option>
                                        <option value="2011">2011年</option>
                                        <option value="2012">2012年</option>
                                        <option value="2013">2013年</option>
                                        <option value="2014">2014年</option>
                                        <option value="2015">2015年</option>
                                        <option value="2016">2016年</option>
                                        <option value="2017">2017年</option>
                                        <option value="2018">2018年</option>
                                        <option value="2019">2019年</option>
                                        <option value="2020">2020年</option>
                                    </select>
                                    <span class="range-separator">至</span>
                                    <select id="endYearSelect" class="form-select">
                                        <option value="">结束年份</option>
                                        <option value="2020">2020年</option>
                                        <option value="2021">2021年</option>
                                        <option value="2022">2022年</option>
                                        <option value="2023">2023年</option>
                                        <option value="2024">2024年</option>
                                        <option value="2025">2025年</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button class="query-submit-btn" onclick="executePriceQuery()">
                            <i class="fas fa-search"></i>
                            <span>查询</span>
                        </button>
                    </div>

                    <!-- 查询结果区域 -->
                    <div class="query-result-section" id="queryResultSection" style="display: none;">
                        <h3><i class="fas fa-chart-line"></i> 查询结果</h3>
                        <div id="queryResultContent"></div>
                    </div>
                </div>
            </div>
        `
    },

    workbench: {
        title: '工作台',
        subtitle: '工作台',
        content: `
            <div class="mobile-page workbench-page">
                <div class="mobile-header">
                    <h1>工作台</h1>
                    <button class="header-message-btn" onclick="showMessages()">
                        <i class="fas fa-bell"></i>
                        <span class="message-badge">3</span>
                    </button>
                </div>
                <div class="mobile-content">
                    <!-- 组织卡片 -->
                    <div class="card org-card">
                        <div class="org-row">
                            <div class="org-name">
                                龙腾虎跃有限公司（壹）
                            </div>
                            <a class="org-switch" href="javascript:void(0)">切换组织 <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                    
                    <!-- 功能网格 -->
                    <div class="card features-card">
                        <div class="features-grid">
                            <div class="feature-item clickable" onclick="loadPage('plantingPlan')">
                                <div class="fi-icon"><i class="fas fa-seedling"></i></div>
                                <div class="fi-text">种植计划</div>
                            </div>
                            <div class="feature-item clickable" onclick="loadPage('farmCalendar')">
                                <div class="fi-icon"><i class="fas fa-calendar-alt"></i></div>
                                <div class="fi-text">农事日历</div>
                            </div>
                            <div class="feature-item">
                                <div class="fi-icon"><i class="fas fa-bug"></i></div>
                                <div class="fi-text">病虫害识别</div>
                            </div>
                            <div class="feature-item">
                                <div class="fi-icon"><i class="fas fa-user-md"></i></div>
                                <div class="fi-text">专家诊断</div>
                            </div>
                            <div class="feature-item">
                                <div class="fi-icon"><i class="fas fa-warehouse"></i></div>
                                <div class="fi-text">投入品管理</div>
                            </div>
                            <div class="feature-item">
                                <div class="fi-icon"><i class="fas fa-file-signature"></i></div>
                                <div class="fi-text">投入品申请</div>
                            </div>
                            <div class="feature-item">
                                <div class="fi-icon"><i class="fas fa-people-carry"></i></div>
                                <div class="fi-text">临时工申请</div>
                            </div>
                            <div class="feature-item">
                                <div class="fi-icon"><i class="fas fa-stamp"></i></div>
                                <div class="fi-text">农事审批</div>
                            </div>
                            <div class="feature-item">
                                <div class="fi-icon"><i class="fas fa-receipt"></i></div>
                                <div class="fi-text">我的领用</div>
                            </div>
                            <div class="feature-item">
                                <div class="fi-icon"><i class="fas fa-tractor"></i></div>
                                <div class="fi-text">农机管理</div>
                            </div>
                            <div class="feature-item clickable" onclick="loadPage('fieldWorkstation')">
                                <div class="fi-icon"><i class="fas fa-microchip"></i></div>
                                <div class="fi-text">田间工作站</div>
                            </div>
                            <div class="feature-item disabled">
                                <div class="fi-icon"><i class="fas fa-ellipsis-h"></i></div>
                                <div class="fi-text">更多</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 底部导航 -->
                <div class="mobile-footer tabbar">
                    <div class="tab-item" data-page="home"><i class="fas fa-home"></i><span>首页</span></div>
                    <div class="tab-item" data-page="mall"><i class="fas fa-store"></i><span>商城</span></div>
                    <div class="tab-item" data-page="ai"><i class="fas fa-robot"></i><span>AI</span></div>
                    <div class="tab-item active" data-page="workbench"><i class="fas fa-briefcase"></i><span>工作台</span></div>
                    <div class="tab-item" data-page="profile"><i class="fas fa-user"></i><span>我的</span></div>
                </div>
            </div>
        `
    },
    ai: {
        title: 'AI',
        subtitle: '多AI能力聚合',
        content: `
            <div class="mobile-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>AI能力</h1>
                    <div class="subtitle">图片识别 · 文本问答 · 方案生成</div>
                </div>
                <div class="mobile-content">
                    <div class="ai-capabilities-grid">
                        <div class="ai-capability-card" onclick="loadPage('aiNewChat')">
                            <div class="capability-icon"><i class="fas fa-search-plus"></i></div>
                            <div class="capability-content">
                                <h3>AI病虫害识别</h3>
                                <p>上传作物图片，智能识别病虫害并给出防治建议</p>
                                <div class="capability-features"><span class="feature-tag">图片识别</span><span class="feature-tag">专家建议</span></div>
                            </div>
                            <div class="capability-arrow"><i class="fas fa-chevron-right"></i></div>
                        </div>
                        <div class="ai-capability-card" onclick="showComingSoon('AI农事问答')">
                            <div class="capability-icon"><i class="fas fa-comments"></i></div>
                            <div class="capability-content">
                                <h3>AI农事问答</h3>
                                <p>与AI对话，获取种植与管理建议</p>
                                <div class="capability-features"><span class="feature-tag">对话</span><span class="feature-tag">知识库</span></div>
                            </div>
                            <div class="capability-arrow"><i class="fas fa-chevron-right"></i></div>
                        </div>
                        <div class="ai-capability-card" onclick="showComingSoon('方案生成')">
                            <div class="capability-icon"><i class="fas fa-magic"></i></div>
                            <div class="capability-content">
                                <h3>AI方案生成</h3>
                                <p>按地块与作物，一键生成可执行的农事方案</p>
                                <div class="capability-features"><span class="feature-tag">自动化</span><span class="feature-tag">个性化</span></div>
                            </div>
                            <div class="capability-arrow"><i class="fas fa-chevron-right"></i></div>
                        </div>
                    </div>
                </div>
                <div class="mobile-footer tabbar">
                    <div class="tab-item" data-page="home"><i class="fas fa-home"></i><span>首页</span></div>
                    <div class="tab-item" data-page="mall"><i class="fas fa-store"></i><span>商城</span></div>
                    <div class="tab-item active" data-page="ai"><i class="fas fa-robot"></i><span>AI</span></div>
                    <div class="tab-item" data-page="workbench"><i class="fas fa-briefcase"></i><span>工作台</span></div>
                    <div class="tab-item" data-page="profile"><i class="fas fa-user"></i><span>我的</span></div>
                </div>
            </div>
        `
    },
    marketplace: {
        title: '商城',
        subtitle: '农资商城',
        content: `
            <div class="mobile-page market-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>农业商城</h1>
                    <div class="subtitle">优质农资一站式采购</div>
                </div>
                <div class="mobile-content">
                    <!-- 搜索框 -->
                    <div class="market-search">
                        <i class="fas fa-search"></i>
                        <input class="market-search-input" placeholder="搜索农资产品…"/>
                    </div>
                    <!-- 分类标签 -->
                    <div class="market-categories">
                        <button class="cat active"><i class="fas fa-seedling"></i><span>种子</span></button>
                        <button class="cat"><i class="fas fa-flask"></i><span>农药</span></button>
                        <button class="cat"><i class="fas fa-box"></i><span>肥料</span></button>
                        <button class="cat"><i class="fas fa-tractor"></i><span>农机</span></button>
                    </div>
                    <!-- 推荐商品 -->
                    <div class="market-section-title">推荐商品</div>
                    <div class="goods-grid">
                        <div class="goods-card">
                            <div class="goods-thumb"><i class="fas fa-leaf"></i></div>
                            <div class="goods-info">
                                <div class="goods-name">优质玉米种子</div>
                                <div class="goods-desc">高产抗病，适合本地种植</div>
                                <div class="goods-bottom">
                                    <div class="goods-price">¥45.00</div>
                                    <button class="goods-add"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                        </div>
                        <div class="goods-card">
                            <div class="goods-thumb"><i class="fas fa-vial"></i></div>
                            <div class="goods-info">
                                <div class="goods-name">生物农药</div>
                                <div class="goods-desc">环保安全，高效防治</div>
                                <div class="goods-bottom">
                                    <div class="goods-price">¥28.50</div>
                                    <button class="goods-add"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                        </div>
                        <div class="goods-card">
                            <div class="goods-thumb"><i class="fas fa-seedling"></i></div>
                            <div class="goods-info">
                                <div class="goods-name">有机肥料</div>
                                <div class="goods-desc">天然有机，改善土壤</div>
                                <div class="goods-bottom">
                                    <div class="goods-price">¥35.00</div>
                                    <button class="goods-add"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                        </div>
                        <div class="goods-card">
                            <div class="goods-thumb"><i class="fas fa-tools"></i></div>
                            <div class="goods-info">
                                <div class="goods-name">小型播种机</div>
                                <div class="goods-desc">轻便高效，操作简单</div>
                                <div class="goods-bottom">
                                    <div class="goods-price">¥1,280.00</div>
                                    <button class="goods-add"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mobile-footer ai-diagnosis-footer">
                    <div class="footer-nav">
                        <div class="nav-item" data-page="home" onclick="loadPage('home')">
                            <i class="fas fa-home"></i>
                            <span>首页</span>
                        </div>
                        <div class="nav-item active" data-page="mall" onclick="loadPage('mall')">
                            <i class="fas fa-store"></i>
                            <span>商城</span>
                        </div>
                        <div class="nav-item" data-page="aiNewChat" onclick="loadPage('aiNewChat')">
                            <i class="fas fa-robot"></i>
                            <span>AI诊断</span>
                        </div>
                        <div class="nav-item" data-page="fieldWorkstation" onclick="loadPage('fieldWorkstation')">
                            <i class="fas fa-briefcase"></i>
                            <span>工作台</span>
                        </div>
                        <div class="nav-item" data-page="profile" onclick="loadPage('profile')">
                            <i class="fas fa-user"></i>
                            <span>我的</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    mall: {
        title: '农业商城',
        subtitle: '优质农资一站式采购',
        content: `
            <div class="mobile-page mall-page">
                <div class="mobile-header">
                    <h1>农业商城</h1>
                    <div class="subtitle">优质农资一站式采购</div>
                </div>
                <div class="mobile-content">
                    <!-- 搜索栏 -->
                    <div class="search-section">
                        <div class="search-bar">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="搜索农资产品...">
                        </div>
                    </div>

                    <!-- 分类导航 -->
                    <div class="category-nav">
                        <div class="category-item active">
                            <i class="fas fa-seedling"></i>
                            <span>种子</span>
                        </div>
                        <div class="category-item">
                            <i class="fas fa-flask"></i>
                            <span>农药</span>
                        </div>
                        <div class="category-item">
                            <i class="fas fa-leaf"></i>
                            <span>肥料</span>
                        </div>
                        <div class="category-item">
                            <i class="fas fa-tools"></i>
                            <span>农机</span>
                        </div>
                    </div>

                    <!-- 商品列表 -->
                    <div class="products-section">
                        <h3>推荐商品</h3>
                        <div class="products-grid">
                            <div class="product-card">
                                <div class="product-image">
                                    <i class="fas fa-seedling"></i>
                                </div>
                                <div class="product-info">
                                    <h4>优质玉米种子</h4>
                                    <p class="product-desc">高产抗病，适合本地种植</p>
                                    <div class="product-price">¥45.00</div>
                                </div>
                                <button class="add-to-cart-btn">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>

                            <div class="product-card">
                                <div class="product-image">
                                    <i class="fas fa-flask"></i>
                                </div>
                                <div class="product-info">
                                    <h4>生物农药</h4>
                                    <p class="product-desc">环保安全，高效防治</p>
                                    <div class="product-price">¥28.50</div>
                                </div>
                                <button class="add-to-cart-btn">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>

                            <div class="product-card">
                                <div class="product-image">
                                    <i class="fas fa-leaf"></i>
                                </div>
                                <div class="product-info">
                                    <h4>有机肥料</h4>
                                    <p class="product-desc">天然有机，改善土壤</p>
                                    <div class="product-price">¥35.00</div>
                                </div>
                                <button class="add-to-cart-btn">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>

                            <div class="product-card">
                                <div class="product-image">
                                    <i class="fas fa-tools"></i>
                                </div>
                                <div class="product-info">
                                    <h4>小型播种机</h4>
                                    <p class="product-desc">轻便高效，操作简单</p>
                                    <div class="product-price">¥1,280.00</div>
                                </div>
                                <button class="add-to-cart-btn">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    ai: {
        title: 'AI智能助手',
        subtitle: '全方位AI能力展示',
        content: `
            <div class="mobile-page ai-page">
                <div class="mobile-header">
                    <h1>AI智能助手</h1>
                    <div class="subtitle">全方位AI能力展示</div>
                </div>
                <div class="mobile-content">
                    <!-- AI能力卡片网格 -->
                    <div class="ai-capabilities-grid">
                        <!-- AI病虫害识别 -->
                        <div class="ai-capability-card" onclick="loadPage('aiNewChat')">
                            <div class="capability-icon">
                                <i class="fas fa-search-plus"></i>
                            </div>
                            <div class="capability-content">
                                <h3>AI病虫害识别</h3>
                                <p>智能识别作物病虫害，提供精准诊断和防治建议</p>
                                <div class="capability-features">
                                    <span class="feature-tag">图片识别</span>
                                    <span class="feature-tag">专家建议</span>
                                    <span class="feature-tag">防治方案</span>
                                </div>
                            </div>
                            <div class="capability-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <!-- 作物生长模型 -->
                        <div class="ai-capability-card" onclick="showComingSoon('作物生长模型')">
                            <div class="capability-icon">
                                <i class="fas fa-seedling"></i>
                            </div>
                            <div class="capability-content">
                                <h3>作物生长模型</h3>
                                <p>基于环境数据和生长规律，预测作物生长状态和产量</p>
                                <div class="capability-features">
                                    <span class="feature-tag">生长预测</span>
                                    <span class="feature-tag">产量估算</span>
                                    <span class="feature-tag">环境分析</span>
                                </div>
                            </div>
                            <div class="capability-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <!-- 农业风险模型 -->
                        <div class="ai-capability-card" onclick="showComingSoon('农业风险模型')">
                            <div class="capability-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="capability-content">
                                <h3>农业风险模型</h3>
                                <p>评估农业生产风险，提供风险预警和应对策略</p>
                                <div class="capability-features">
                                    <span class="feature-tag">风险评估</span>
                                    <span class="feature-tag">预警系统</span>
                                    <span class="feature-tag">应对策略</span>
                                </div>
                            </div>
                            <div class="capability-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <!-- 灾害预警模型 -->
                        <div class="ai-capability-card" onclick="showComingSoon('灾害预警模型')">
                            <div class="capability-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="capability-content">
                                <h3>灾害预警模型</h3>
                                <p>实时监测气象数据，提前预警自然灾害对农业的影响</p>
                                <div class="capability-features">
                                    <span class="feature-tag">气象监测</span>
                                    <span class="feature-tag">灾害预警</span>
                                    <span class="feature-tag">影响评估</span>
                                </div>
                            </div>
                            <div class="capability-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>

                        <!-- 专家模型 -->
                        <div class="ai-capability-card" onclick="showComingSoon('专家模型')">
                            <div class="capability-icon">
                                <i class="fas fa-user-graduate"></i>
                            </div>
                            <div class="capability-content">
                                <h3>专家模型</h3>
                                <p>集成农业专家知识，提供专业咨询和决策支持</p>
                                <div class="capability-features">
                                    <span class="feature-tag">专家知识</span>
                                    <span class="feature-tag">智能咨询</span>
                                    <span class="feature-tag">决策支持</span>
                                </div>
                            </div>
                            <div class="capability-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>

                    <!-- AI使用统计 -->
                    <div class="ai-stats-section">
                        <h3>AI使用统计</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-number">156</div>
                                <div class="stat-label">今日诊断</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">89%</div>
                                <div class="stat-label">准确率</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">2.3k</div>
                                <div class="stat-label">累计服务</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    aiDiagnosis: {
        title: '诊断结果',
        subtitle: '智能识别 · 专家建议',
        content: `
            <div class="mobile-page ai-diagnosis-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('aiNewChat')">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1>诊断结果</h1>
                </div>
                <div class="mobile-content">
                    <!-- 用户提交内容回显 -->
                    <div class="card user-input-summary" id="userInputSummary">
                        <div class="card-title">
                            <i class="fas fa-user-check"></i>
                            您的提交内容
                        </div>
                        <div class="input-summary-content" id="inputSummaryContent">
                            <div class="summary-images" id="summaryImages"></div>
                            <div class="summary-text" id="summaryText"></div>
                        </div>
                    </div>

                    <!-- 诊断状态卡片 -->
                    <div class="card diagnosis-status-card" id="diagnosisStatusCard">
                        <div class="progress-steps">
                            <div class="progress-step" id="step-1">
                                <div class="step-box">
                                    <div class="step-icon">📷</div>
                                    <div class="step-check">✅</div>
                                </div>
                                <div class="step-text">图像识别</div>
                            </div>
                            <div class="progress-step" id="step-2">
                                <div class="step-box">
                                    <div class="step-icon">🧠</div>
                                    <div class="step-check">✅</div>
                                </div>
                                <div class="step-text">AI分析</div>
                            </div>
                            <div class="progress-step" id="step-3">
                                <div class="step-box">
                                    <div class="step-icon">🔍</div>
                                    <div class="step-check">✅</div>
                                </div>
                                <div class="step-text">特征匹配</div>
                            </div>
                            <div class="progress-step" id="step-4">
                                <div class="step-box">
                                    <div class="step-icon">📝</div>
                                    <div class="step-check">✅</div>
                                </div>
                                <div class="step-text">结果生成</div>
                            </div>
                        </div>
                    </div>

                    <!-- AI诊断结果 -->
                    <div class="card diagnosis-result-card" id="diagnosisResult" style="display: none;">
                        <div class="card-title">
                            <i class="fas fa-check-circle"></i>
                            AI诊断结果
                        </div>
                        <div class="result-content">
                            <div class="disease-info">
                                <div class="disease-name">疑似：玉米锈病</div>
                                <div class="confidence">相似度：91%</div>
                            </div>
                            <div class="disease-desc">
                                根据您提供的图片，这是一片玉米叶片，其上出现的黄褐色斑点和条状病斑，结合发病部位及症状特征，高度疑似玉米南方锈病(Southern Corn Rust, Puccinia polysora)。
                            </div>
                            
                            <div class="diagnosis-basis">
                                <div class="basis-title">
                                    <i class="fas fa-check-circle"></i>
                                    诊断依据
                                </div>
                                <div class="basis-content">
                                    <div class="basis-item">
                                        <div class="basis-label">病斑形态：</div>
                                        <div class="basis-text">病斑呈橙色至红褐色，小而密集，通常在叶面形成不规则的斑块。随着病情发展，病斑逐渐变为黄褐色或灰白色，表面可能有细小的粉状物(孢子堆)，尤其在高湿条件下更明显。</div>
                                    </div>
                                    <div class="basis-item">
                                        <div class="basis-label">发病部位：</div>
                                        <div class="basis-text">主要发生在叶片的中下部，向上蔓延，严重时可覆盖整个叶片。</div>
                                    </div>
                                    <div class="basis-item">
                                        <div class="basis-label">流行条件：</div>
                                        <div class="basis-text">高温高湿(25-30℃)、多雨、通风不良的环境易发。该病在夏玉米区、南方产区尤为常见，近年来在我国华南、西南、黄淮海地区均有爆发趋势。</div>
                                    </div>
                                    <div class="basis-item">
                                        <div class="basis-label">与其它病害的区别：</div>
                                        <div class="basis-text">玉米大斑病：病斑较大，呈长椭圆形，边缘紫褐色，中央灰白，无粉状物。玉米小斑病：病斑较小，呈椭圆形，边缘深褐色，中央浅褐色。</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="diagnosis-image">
                                <img src="image.png" alt="玉米锈病症状图片" />
                            </div>
                        </div>
                    </div>

                    <!-- 专家推荐与连线 - 合并设计 -->
                    <div class="card expert-section-card" id="expertSection" style="display: none;">
                        <div class="card-title">
                            <i class="fas fa-user-md"></i>
                            专家推荐与连线
                        </div>
                        
                        <!-- 专家卡片滑动区域 -->
                        <div class="experts-carousel">
                            <div class="experts-container" id="expertsContainer">
                                <!-- 专家卡片1 -->
                                <div class="expert-card active">
                                    <div class="expert-avatar">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiM0Q0FGNTIiLz4KPHN2ZyB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMEgxOEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+" alt="专家头像">
                                    </div>
                                    <div class="expert-info">
                                        <div class="expert-name">张农技专家</div>
                                        <div class="expert-title">高级农艺师 · 15年经验</div>
                                        <div class="expert-specialty">专长：叶斑病防治</div>
                                    </div>
                                    <div class="expert-badges">
                                        <span class="badge expert">认证专家</span>
                                        <span class="badge rating">评分 4.9</span>
                                    </div>
                                    <div class="expert-recommendation">
                                        <div class="recommendation-title">防治建议：</div>
                                        <div class="recommendation-text">
                                            1. 立即清除病叶，减少病原菌传播<br>
                                            2. 改善通风条件，降低湿度<br>
                                            3. 使用推荐药剂进行防治
                                        </div>
                                    </div>
                                    <div class="expert-actions">
                                        <button class="btn-connect-voice">
                                            <i class="fas fa-phone"></i>
                                            语音咨询 ¥50
                                        </button>
                                        <button class="btn-connect-video">
                                            <i class="fas fa-video"></i>
                                            视频指导 ¥80
                                        </button>
                                    </div>
                                </div>

                                <!-- 专家卡片2 -->
                                <div class="expert-card">
                                    <div class="expert-avatar">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMEgxOEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+" alt="专家头像">
                                    </div>
                                    <div class="expert-info">
                                        <div class="expert-name">李植保专家</div>
                                        <div class="expert-title">植保专家 · 12年经验</div>
                                        <div class="expert-specialty">专长：病害诊断</div>
                                    </div>
                                    <div class="expert-badges">
                                        <span class="badge expert">认证专家</span>
                                        <span class="badge rating">评分 4.8</span>
                                    </div>
                                    <div class="expert-recommendation">
                                        <div class="recommendation-title">防治建议：</div>
                                        <div class="recommendation-text">
                                            1. 加强田间管理，预防病害<br>
                                            2. 合理施肥，增强抗病性<br>
                                            3. 及时用药，控制病情发展
                                        </div>
                                    </div>
                                    <div class="expert-actions">
                                        <button class="btn-connect-voice">
                                            <i class="fas fa-phone"></i>
                                            语音咨询 ¥50
                                        </button>
                                        <button class="btn-connect-video">
                                            <i class="fas fa-video"></i>
                                            视频指导 ¥80
                                        </button>
                                    </div>
                                </div>

                                <!-- 专家卡片3 -->
                                <div class="expert-card">
                                    <div class="expert-avatar">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNGRjY5MDAiLz4KPHN2ZyB4PSIxNSIgeT0iMTUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMEgxOEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+" alt="专家头像">
                                    </div>
                                    <div class="expert-info">
                                        <div class="expert-name">王农艺师</div>
                                        <div class="expert-title">农艺师 · 18年经验</div>
                                        <div class="expert-specialty">专长：综合防治</div>
                                    </div>
                                    <div class="expert-badges">
                                        <span class="badge expert">认证专家</span>
                                        <span class="badge rating">评分 4.9</span>
                                    </div>
                                    <div class="expert-recommendation">
                                        <div class="recommendation-title">防治建议：</div>
                                        <div class="recommendation-text">
                                            1. 综合防治，标本兼治<br>
                                            2. 生物防治与化学防治结合<br>
                                            3. 长期监控，预防为主
                                        </div>
                                    </div>
                                    <div class="expert-actions">
                                        <button class="btn-connect-voice">
                                            <i class="fas fa-phone"></i>
                                            语音咨询 ¥50
                                        </button>
                                        <button class="btn-connect-video">
                                            <i class="fas fa-video"></i>
                                            视频指导 ¥80
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 滑动指示器 -->
                            <div class="carousel-indicators">
                                <span class="indicator active" data-index="0"></span>
                                <span class="indicator" data-index="1"></span>
                                <span class="indicator" data-index="2"></span>
                            </div>
                        </div>
                    </div>

                    <!-- 推荐农资产品 - 简化设计 -->
                    <div class="card product-recommendation-card" id="productRecommendation" style="display: none;">
                        <div class="card-title">
                            <i class="fas fa-shopping-cart"></i>
                            推荐农资产品
                        </div>
                        
                        <div class="product-list">
                            <div class="product-item">
                                <div class="product-info">
                                    <div class="product-name">多菌灵可湿性粉剂</div>
                                    <div class="product-desc">广谱杀菌剂，对叶斑病效果显著</div>
                                    <div class="product-tags">
                                        <span class="tag expert-tag">专家推荐</span>
                                        <span class="tag ai-tag">AI匹配</span>
                                    </div>
                                </div>
                                <div class="product-price">
                                    <div class="price">¥28.00</div>
                                    <button class="btn-buy">立即购买</button>
                                </div>
                            </div>
                            
                            <div class="product-item">
                                <div class="product-info">
                                    <div class="product-name">代森锰锌水分散粒剂</div>
                                    <div class="product-desc">保护性杀菌剂，预防效果佳</div>
                                    <div class="product-tags">
                                        <span class="tag ai-tag">AI推荐</span>
                                    </div>
                                </div>
                                <div class="product-price">
                                    <div class="price">¥35.00</div>
                                    <button class="btn-buy">立即购买</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 底部三菜单（AI 相关） -->
                <div class="mobile-footer ai-diagnosis-footer">
                    <div class="footer-nav">
                        <div class="nav-item" onclick="loadPage('aiNewChat')">
                            <i class="fas fa-plus"></i>
                            <span>AI诊断</span>
                        </div>
                        <div class="nav-item" onclick="loadPage('expertRecommend')">
                            <i class="fas fa-user-md"></i>
                            <span>专家推荐</span>
                        </div>
                        <div class="nav-item" onclick="loadPage('historyDialog')">
                            <i class="fas fa-history"></i>
                            <span>历史对话</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    },

    aiNewChat: {
        title: 'AI诊断',
        subtitle: '发起新的AI诊断会话',
        content: `
            <div class="mobile-page ai-newchat-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('home')"><i class="fas fa-arrow-left"></i></button>
                    <h1>AI诊断</h1>
                </div>
                <div class="mobile-content">
                    <div class="card ai-diagnosis-card">
                        <div class="ai-card-header">
                            <div class="ai-card-title"><i class="fas fa-robot"></i><span>AI病虫害诊断</span></div>
                            <div class="ai-card-subtitle">描述问题，上传图片，开始一次新的诊断</div>
                        </div>
                        <div class="ai-card-content">
                            <div class="combined-input-container">
                                <textarea id="inlineQuestionTextarea" class="combined-textarea" placeholder="告诉我您的问题吧～" rows="4"></textarea>
                                <div class="embedded-upload-area">
                                    <div class="embedded-upload-trigger" id="embeddedUploadTrigger"><i class="fas fa-image"></i><span>添加图片</span></div>
                                    <div class="embedded-image-preview" id="embeddedImagePreview"></div>
                                </div>
                                <input type="file" id="embeddedImageInput" accept="image/*" style="display:none" multiple>
                            </div>
                            <div style="text-align:center; margin-top:10px;">
                                <a href="javascript:void(0)" onclick="loadPage('historyDialog')" style="color:#9aa0a6; font-size:12px;">查看历史记录</a>
                            </div>
                            <div class="ai-card-actions">
                                <button class="btn-start-ai-diagnosis" onclick="submitNewConversation()"><i class="fas fa-brain"></i><span>开始AI诊断</span></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mobile-footer ai-diagnosis-footer">
                    <div class="footer-nav">
                        <div class="nav-item active" onclick="loadPage('aiNewChat')"><i class="fas fa-plus"></i><span>AI诊断</span></div>
                        <div class="nav-item" onclick="loadPage('expertRecommend')"><i class="fas fa-user-md"></i><span>专家推荐</span></div>
                        <div class="nav-item" onclick="loadPage('historyDialog')"><i class="fas fa-history"></i><span>历史对话</span></div>
                    </div>
                </div>
            </div>
        `
    },

    expertRecommend: {
        title: '专家推荐',
        subtitle: '为您匹配合适的专家',
        content: `
            <div class="mobile-page expert-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('home')"><i class="fas fa-arrow-left"></i></button>
                    <h1>专家推荐</h1>
                </div>
                <div class="mobile-content">
                    <div class="card">
                        <div class="search-bar"><i class="fas fa-search"></i><input type="text" placeholder="搜索专家/标签/知识库"></div>
                    </div>
                    <div class="card expert-card" onclick="loadPage('expertDetail', 'wangjianguo')">
                        <div class="expert-header">
                            <div class="avatar"><i class="fas fa-user-tie"></i></div>
                            <div class="info">
                                <div class="name">王建国</div>
                                <div class="tags"><span class="tag">玉米病害</span><span class="tag">小麦锈病</span></div>
                            </div>
                            <button class="btn" style="padding:8px 12px;">查看</button>
                        </div>
                        <div class="expert-extras">
                            <div>专家知识库（可购买）</div>
                            <div class="product-tags"><span class="tag">杀菌剂A</span><span class="tag">防治套餐</span></div>
                        </div>
                    </div>
                    <div class="card expert-card" onclick="loadPage('expertDetail', 'limin')">
                        <div class="expert-header">
                            <div class="avatar"><i class="fas fa-user-tie"></i></div>
                            <div class="info">
                                <div class="name">李敏</div>
                                <div class="tags"><span class="tag">水稻虫害</span><span class="tag">植保方案</span></div>
                            </div>
                            <button class="btn" style="padding:8px 12px;">查看</button>
                        </div>
                        <div class="expert-extras">
                            <div>专家知识库（可购买）</div>
                            <div class="product-tags"><span class="tag">虫害套装</span></div>
                        </div>
                    </div>
                    <div class="card expert-card" onclick="loadPage('expertDetail', 'zhangsan')">
                        <div class="expert-header">
                            <div class="avatar"><i class="fas fa-user-tie"></i></div>
                            <div class="info">
                                <div class="name">张三</div>
                                <div class="tags"><span class="tag">果树病害</span><span class="tag">土壤改良</span></div>
                            </div>
                            <button class="btn" style="padding:8px 12px;">查看</button>
                        </div>
                        <div class="expert-extras">
                            <div>专家知识库（可购买）</div>
                            <div class="product-tags"><span class="tag">有机肥料</span><span class="tag">土壤调理剂</span></div>
                        </div>
                    </div>
                    <div class="card expert-card" onclick="loadPage('expertDetail', 'lisi')">
                        <div class="expert-header">
                            <div class="avatar"><i class="fas fa-user-tie"></i></div>
                            <div class="info">
                                <div class="name">李四</div>
                                <div class="tags"><span class="tag">蔬菜种植</span><span class="tag">温室管理</span></div>
                            </div>
                            <button class="btn" style="padding:8px 12px;">查看</button>
                        </div>
                        <div class="expert-extras">
                            <div>专家知识库（可购买）</div>
                            <div class="product-tags"><span class="tag">温室设备</span><span class="tag">种植技术</span></div>
                        </div>
                    </div>
                    <div class="card expert-card" onclick="loadPage('expertDetail', 'wangwu')">
                        <div class="expert-header">
                            <div class="avatar"><i class="fas fa-user-tie"></i></div>
                            <div class="info">
                                <div class="name">王五</div>
                                <div class="tags"><span class="tag">植保技术</span><span class="tag">农药使用</span></div>
                            </div>
                            <button class="btn" style="padding:8px 12px;">查看</button>
                        </div>
                        <div class="expert-extras">
                            <div>专家知识库（可购买）</div>
                            <div class="product-tags"><span class="tag">安全用药</span><span class="tag">植保方案</span></div>
                        </div>
                    </div>
                </div>
                <div class="mobile-footer ai-diagnosis-footer">
                    <div class="footer-nav">
                        <div class="nav-item" onclick="loadPage('aiNewChat')"><i class="fas fa-plus"></i><span>AI诊断</span></div>
                        <div class="nav-item active" onclick="loadPage('expertRecommend')"><i class="fas fa-user-md"></i><span>专家推荐</span></div>
                        <div class="nav-item" onclick="loadPage('historyDialog')"><i class="fas fa-history"></i><span>历史对话</span></div>
                    </div>
                </div>
            </div>
        `
    },

    historyDialog: {
        title: '历史对话',
        subtitle: '查看以往会话',
        content: `
            <div class="mobile-page history-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('home')"><i class="fas fa-arrow-left"></i></button>
                    <h1>历史对话</h1>
                </div>
                <div class="mobile-content">
                    <div class="card">
                        <div class="search-bar"><i class="fas fa-search"></i><input type="text" placeholder="搜索历史问题/日期" oninput="filterHistory(this.value)"></div>
                    </div>
                    <div class="card history-item" onclick="loadPage('aiDiagnosis', 'conv1')">
                        <div class="history-header">
                            <div class="history-title">玉米叶片出现黄褐色斑点</div>
                            <div class="history-date">2024-01-15 14:30</div>
                        </div>
                        <div class="history-content">
                            <div class="history-preview">疑似玉米锈病，建议使用多菌灵可湿性粉剂进行防治...</div>
                            <div class="history-status completed">已完成</div>
                        </div>
                    </div>
                    <div class="card history-item" onclick="loadPage('aiDiagnosis', 'conv2')">
                        <div class="history-header">
                            <div class="history-title">小麦叶片有白色粉末状物质</div>
                            <div class="history-date">2024-01-14 09:15</div>
                        </div>
                        <div class="history-content">
                            <div class="history-preview">诊断为小麦白粉病，推荐使用三唑酮进行防治...</div>
                            <div class="history-status completed">已完成</div>
                        </div>
                    </div>
                    <div class="card history-item" onclick="loadPage('aiDiagnosis', 'conv3')">
                        <div class="history-header">
                            <div class="history-title">水稻叶片边缘发黄枯萎</div>
                            <div class="history-date">2024-01-13 16:45</div>
                        </div>
                        <div class="history-content">
                            <div class="history-preview">可能是水稻纹枯病，建议改善田间通风条件...</div>
                            <div class="history-status completed">已完成</div>
                        </div>
                    </div>
                    <div class="card history-item" onclick="loadPage('aiDiagnosis', 'conv4')">
                        <div class="history-header">
                            <div class="history-title">番茄果实表面有黑色斑点</div>
                            <div class="history-date">2024-01-12 11:20</div>
                        </div>
                        <div class="history-content">
                            <div class="history-preview">疑似番茄早疫病，推荐使用代森锰锌进行防治...</div>
                            <div class="history-status completed">已完成</div>
                        </div>
                    </div>
                    <div class="card history-item" onclick="loadPage('aiDiagnosis', 'conv5')">
                        <div class="history-header">
                            <div class="history-title">黄瓜叶片出现水渍状病斑</div>
                            <div class="history-date">2024-01-11 08:30</div>
                        </div>
                        <div class="history-content">
                            <div class="history-preview">诊断为黄瓜霜霉病，建议使用甲霜灵进行防治...</div>
                            <div class="history-status completed">已完成</div>
                        </div>
                    </div>
                </div>
                <div class="mobile-footer ai-diagnosis-footer">
                    <div class="footer-nav">
                        <div class="nav-item" onclick="loadPage('aiNewChat')"><i class="fas fa-plus"></i><span>AI诊断</span></div>
                        <div class="nav-item" onclick="loadPage('expertRecommend')"><i class="fas fa-user-tie"></i><span>专家推荐</span></div>
                        <div class="nav-item active" onclick="loadPage('historyDialog')"><i class="fas fa-history"></i><span>历史对话</span></div>
                    </div>
                </div>
            </div>
        `
    },

    expertDetail: {
        title: '专家详情',
        subtitle: '专家信息与服务',
        content: `
            <div class="mobile-page expert-detail-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="loadPage('expertRecommend')"><i class="fas fa-arrow-left"></i></button>
                    <h1>专家详情</h1>
                </div>
                <div class="mobile-content">
                    <div class="card expert-profile-card">
                        <div class="expert-avatar-large">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="expert-info">
                            <h2 id="expertName">王建国</h2>
                            <div class="expert-title">认证专家 · 评分 4.9</div>
                            <div class="expert-specialties" id="expertSpecialties">
                                <span class="tag">玉米病害</span>
                                <span class="tag">小麦锈病</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-title">
                            <i class="fas fa-graduation-cap"></i>
                            专业背景
                        </div>
                        <div class="expert-background" id="expertBackground">
                            从事农业植保工作15年，专注于玉米和小麦病害研究，发表相关论文20余篇，具有丰富的田间实践经验。
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title">
                            <i class="fas fa-book"></i>
                            知识库服务
                        </div>
                        <div class="knowledge-items" id="knowledgeItems">
                            <div class="knowledge-item">
                                <div class="knowledge-title">玉米病害诊断手册</div>
                                <div class="knowledge-desc">包含50+种玉米常见病害的识别与防治方法</div>
                                <div class="knowledge-price">¥29.9</div>
                            </div>
                            <div class="knowledge-item">
                                <div class="knowledge-title">小麦锈病防治方案</div>
                                <div class="knowledge-desc">专业的小麦锈病预防与治疗指导</div>
                                <div class="knowledge-price">¥19.9</div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title">
                            <i class="fas fa-shopping-cart"></i>
                            推荐产品
                        </div>
                        <div class="product-items" id="productItems">
                            <div class="product-item">
                                <div class="product-name">杀菌剂A</div>
                                <div class="product-desc">广谱杀菌剂，对叶斑病效果显著</div>
                                <div class="product-tags">
                                    <span class="tag">专家推荐</span>
                                    <span class="tag">AI匹配</span>
                                </div>
                                <div class="product-price">¥28.00</div>
                                <button class="btn-buy">立即购买</button>
                            </div>
                            <div class="product-item">
                                <div class="product-name">防治套餐</div>
                                <div class="product-desc">综合防治方案，包含多种药剂</div>
                                <div class="product-tags">
                                    <span class="tag">专家推荐</span>
                                </div>
                                <div class="product-price">¥128.00</div>
                                <button class="btn-buy">立即购买</button>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title">
                            <i class="fas fa-phone"></i>
                            咨询服务
                        </div>
                        <div class="consultation-options">
                            <button class="consultation-btn voice-consult">
                                <i class="fas fa-phone"></i>
                                <span>语音咨询</span>
                                <span class="price">¥50/次</span>
                            </button>
                            <button class="consultation-btn video-consult">
                                <i class="fas fa-video"></i>
                                <span>视频指导</span>
                                <span class="price">¥80/次</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    profile: {
        title: '我的',
        subtitle: '个人中心',
        content: `
            <div class="mobile-page profile-page">
                <div class="mobile-header">
                    <h1>我的</h1>
                    <div class="header-actions">
                        <i class="fas fa-ellipsis-v"></i>
                        <i class="fas fa-bullseye"></i>
                    </div>
                </div>
                <div class="mobile-content">
                    <!-- 用户信息卡片 -->
                    <div class="user-profile-card">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-info">
                            <div class="user-name">龙</div>
                            <div class="user-org">龙腾虎跃有限公司（壹）</div>
                        </div>
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    
                    <!-- 电商服务 -->
                    <div class="card">
                        <div class="card-title">电商服务</div>
                        <div class="ecommerce-grid">
                            <div class="ecommerce-item">
                                <div class="ecommerce-icon orange"><i class="fas fa-shopping-cart"></i></div>
                                <div class="ecommerce-text">购物车</div>
                            </div>
                            <div class="ecommerce-item">
                                <div class="ecommerce-icon blue"><i class="fas fa-file-alt"></i></div>
                                <div class="ecommerce-text">我的订单</div>
                            </div>
                            <div class="ecommerce-item">
                                <div class="ecommerce-icon orange"><i class="fas fa-star"></i></div>
                                <div class="ecommerce-text">我的评价</div>
                            </div>
                            <div class="ecommerce-item">
                                <div class="ecommerce-icon blue"><i class="fas fa-map-marker-alt"></i></div>
                                <div class="ecommerce-text">地址管理</div>
                            </div>
                            <div class="ecommerce-item">
                                <div class="ecommerce-icon orange"><i class="fas fa-heart"></i></div>
                                <div class="ecommerce-text">我的关注</div>
                            </div>
                            <div class="ecommerce-item">
                                <div class="ecommerce-icon blue"><i class="fas fa-headset"></i></div>
                                <div class="ecommerce-text">售后服务</div>
                            </div>
                            <div class="ecommerce-item">
                                <div class="ecommerce-icon green"><i class="fas fa-history"></i></div>
                                <div class="ecommerce-text">浏览记录</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 其它功能 -->
                    <div class="card">
                        <div class="card-title">其它</div>
                        <div class="other-functions">
                            <div class="other-item">
                                <div class="other-icon green"><i class="fas fa-sitemap"></i></div>
                                <div class="other-text">组织架构管理</div>
                                <i class="fas fa-chevron-right"></i>
                            </div>
                            <div class="other-item">
                                <div class="other-icon green"><i class="fas fa-lock"></i></div>
                                <div class="other-text">账号与安全</div>
                                <i class="fas fa-chevron-right"></i>
                            </div>
                            <div class="other-item">
                                <div class="other-icon green"><i class="fas fa-comment-dots"></i></div>
                                <div class="other-text">意见反馈</div>
                                <i class="fas fa-chevron-right"></i>
                            </div>
                            <div class="other-item">
                                <div class="other-icon green"><i class="fas fa-info-circle"></i></div>
                                <div class="other-text">关于我们</div>
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <button class="btn-primary">开启个人农场</button>
                        <button class="btn-secondary">退出登录</button>
                    </div>
                </div>
                
                <!-- 浮动按钮 -->
                <div class="floating-buttons">
                    <div class="fab ai-assistant">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="fab customer-service">
                        <i class="fas fa-headset"></i>
                    </div>
                </div>

                <!-- 底部导航 -->
                <div class="mobile-footer tabbar">
                    <div class="tab-item" data-page="home"><i class="fas fa-home"></i><span>首页</span></div>
                    <div class="tab-item" data-page="mall"><i class="fas fa-store"></i><span>商城</span></div>
                    <div class="tab-item" data-page="ai"><i class="fas fa-robot"></i><span>AI</span></div>
                    <div class="tab-item" data-page="workbench"><i class="fas fa-briefcase"></i><span>工作台</span></div>
                    <div class="tab-item active" data-page="profile"><i class="fas fa-user"></i><span>我的</span></div>
                </div>
            </div>
        `
    },
    
    messages: {
        title: '消息',
        subtitle: '消息中心',
        content: `
            <div class="mobile-page">
                <div class="mobile-header">
                    <h1>消息</h1>
                </div>
                <div class="mobile-content">
                    <div class="card">
                        <div class="empty-state">
                            <i class="fas fa-comment-slash"></i>
                            <h3>暂无消息</h3>
                            <p>您还没有收到任何消息</p>
                        </div>
                    </div>
                </div>

                <!-- 底部导航 -->
                <div class="mobile-footer tabbar">
                    <div class="tab-item" data-page="home"><i class="fas fa-home"></i><span>首页</span></div>
                    <div class="tab-item" data-page="workbench"><i class="fas fa-briefcase"></i><span>工作台</span></div>
                    <div class="tab-item active" data-page="messages"><i class="fas fa-comment"></i><span>消息</span></div>
                    <div class="tab-item" data-page="profile"><i class="fas fa-user"></i><span>我的</span></div>
                </div>
            </div>
        `
    },
    
    settings: {
        title: '设置',
        subtitle: '系统设置与偏好',
        content: `
            <div class="mobile-page">
                <div class="mobile-header">
                    <h1>设置</h1>
                    <div class="subtitle">系统设置与偏好</div>
                </div>
                <div class="mobile-content">
                    <div class="card">
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-bell"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">消息通知</div>
                                <div class="list-item-subtitle">管理推送通知设置</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">隐私安全</div>
                                <div class="list-item-subtitle">账户安全设置</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-language"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">语言设置</div>
                                <div class="list-item-subtitle">简体中文</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-moon"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">深色模式</div>
                                <div class="list-item-subtitle">切换深色主题</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-question-circle"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">帮助中心</div>
                                <div class="list-item-subtitle">使用指南与常见问题</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">关于我们</div>
                                <div class="list-item-subtitle">版本 1.0.0</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    farmCalendar: {
        title: '农事日历',
        subtitle: '农事活动管理',
        content: `
            <div class="mobile-page farmCalendar-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>农事日历</h1>
                    <div class="subtitle">农事活动管理</div>
                </div>
                <div class="mobile-content">
                    <!-- 日历导航 -->
                    <div class="calendar-nav">
                        <div class="calendar-header">
                            <i class="fas fa-chevron-left"></i>
                            <span>2024年1月</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                        <div class="weekdays">
                            <div class="weekday">日</div>
                            <div class="weekday">一</div>
                            <div class="weekday">二</div>
                            <div class="weekday">三</div>
                            <div class="weekday">四</div>
                            <div class="weekday">五</div>
                            <div class="weekday">六</div>
                        </div>
                        <div class="date-row">
                            <div class="date-item">
                                <div class="date-number">31</div>
                                <div class="date-text">12月</div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">1</div>
                                <div class="date-text">元旦</div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">2</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">3</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">4</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">5</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">6</div>
                                <div class="date-text"></div>
                            </div>
                        </div>
                        <div class="date-row">
                            <div class="date-item">
                                <div class="date-number">7</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">8</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">9</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">10</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">11</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">12</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">13</div>
                                <div class="date-text"></div>
                            </div>
                        </div>
                        <div class="date-row">
                            <div class="date-item">
                                <div class="date-number">14</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">15</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item today">
                                <div class="date-number">16</div>
                                <div class="date-text">今天</div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">17</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">18</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">19</div>
                                <div class="date-text"></div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">20</div>
                                <div class="date-text"></div>
                            </div>
                        </div>
                        <div class="calendar-expand">
                            <i class="fas fa-chevron-down"></i> 展开更多
                        </div>
                    </div>
                    
                    <!-- 活动列表 -->
                    <div class="activities-section">
                        <h3>今日活动</h3>
                        <div class="activity-card" onclick="loadPage('farmActivityDetail')">
                            <div class="activity-header">
                                <span class="activity-tag spraying">打药</span>
                                <div class="activity-title">打药测试 1</div>
                                <i class="fas fa-ellipsis-v activity-menu"></i>
                            </div>
                            <div class="activity-details">
                                <div class="detail-item">
                                    <span class="detail-label">时间：</span>
                                    <span class="detail-value">09:00 - 11:00</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">地点：</span>
                                    <span class="detail-value">A区小麦田</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">负责人：</span>
                                    <span class="detail-value">张三</span>
                                </div>
                            </div>
                            <div class="activity-status">
                                <div class="status-stamp">已完成</div>
                            </div>
                        </div>
                        
                        <div class="activity-card">
                            <div class="activity-header">
                                <span class="activity-tag weeding">除草</span>
                                <div class="activity-title">除草作业</div>
                                <i class="fas fa-ellipsis-v activity-menu"></i>
                            </div>
                            <div class="activity-details">
                                <div class="detail-item">
                                    <span class="detail-label">时间：</span>
                                    <span class="detail-value">14:00 - 16:00</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">地点：</span>
                                    <span class="detail-value">B区玉米田</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">负责人：</span>
                                    <span class="detail-value">李四</span>
                                </div>
                            </div>
                            <div class="activity-status">
                                <div class="status-stamp">进行中</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 悬浮添加按钮 -->
                <div class="fab">
                    <i class="fas fa-plus"></i>
                </div>
            </div>
        `
    },
    
    plantingPlan: {
        title: '种植计划',
        subtitle: '管理种植计划',
        content: `
            <div class="mobile-page plantingPlan-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>种植计划</h1>
                    <div class="subtitle">管理种植计划</div>
                </div>
                <div class="mobile-content">
                    <!-- 主导航标签 -->
                    <div class="plan-tabs">
                        <div class="plan-tab">
                            <i class="fas fa-book"></i>
                            <span>指导方案库</span>
                        </div>
                        <div class="plan-tab active">
                            <i class="fas fa-file-alt"></i>
                            <span>我的方案</span>
                        </div>
                    </div>
                    
                    <!-- 子标签过滤器 -->
                    <div class="filter-tabs">
                        <div class="filter-tab">全部</div>
                        <div class="filter-tab">未开始</div>
                        <div class="filter-tab active">进行中</div>
                        <div class="filter-tab">已完成</div>
                    </div>
                    
                    <!-- 种植计划卡片 -->
                    <div class="plan-card">
                        <div class="plan-header">
                            <div class="plan-status">
                                <span class="status-badge">进行中</span>
                                <span class="plan-type">打药</span>
                            </div>
                        </div>
                        <div class="plan-details">
                            <div class="detail-row">
                                <span class="detail-label">项目：</span>
                                <span class="detail-value">大厅水培植物 | 一号分区</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">基地/地块：</span>
                                <span class="detail-value">大厅水培植物 | 一号分区 | 一号基地(水培区 | 一号地块)</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">作物及品种：</span>
                                <span class="detail-value">水仙花(1号)</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">种植周期：</span>
                                <span class="detail-value">水仙花(2025-08-12~2025-08-15)</span>
                            </div>
                        </div>
                        <div class="plan-expand">
                            <span>展开</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="plan-actions">
                            <button class="btn btn-danger">结束</button>
                            <button class="btn btn-primary">查看农事活动</button>
                        </div>
                    </div>
                </div>

                <!-- 悬浮添加按钮 -->
                <div class="fab">
                    <i class="fas fa-plus"></i>
                </div>
            </div>
        `
    },
    
    addFarmActivity: {
        title: '添加农事活动',
        subtitle: '创建新的农事活动',
        content: `
            <div class="mobile-page addFarmActivity-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>添加农事活动</h1>
                </div>
                <div class="mobile-content">
                    <!-- AI语音输入提示 -->
                    <div class="ai-voice-tip">
                        <div class="tip-content">
                            <i class="fas fa-microphone-alt"></i>
                            <span>点击下方AI按钮，语音输入表单信息</span>
                        </div>
                        <div class="tip-examples">
                            <span class="example-title">示例：</span>
                            <span class="example-text">"我要为大厅水培植物基地的水仙花安排打药活动，时间是明天上午9点到11点，负责人是王成龙"</span>
                        </div>
                    </div>
                    
                    <div class="form-container">
                        <!-- 种植计划 -->
                        <div class="form-group">
                            <label class="form-label required">种植计划:</label>
                            <div class="form-input-wrapper">
                                <input type="text" class="form-input" id="plantingPlan" placeholder="请选择">
                                <i class="fas fa-chevron-down"></i>
                            </div>
                        </div>
                        
                        <!-- 基地地块 -->
                        <div class="form-group">
                            <label class="form-label required">基地地块</label>
                            <input type="text" class="form-input" id="basePlot" placeholder="">
                        </div>
                        
                        <!-- 作物 -->
                        <div class="form-group">
                            <label class="form-label required">作物:</label>
                            <input type="text" class="form-input" id="crop" placeholder="">
                        </div>
                        
                        <!-- 农事类型 -->
                        <div class="form-group">
                            <label class="form-label required">农事类型:</label>
                            <div class="form-input-wrapper">
                                <input type="text" class="form-input" id="activityType" placeholder="请选择">
                                <button class="add-type-btn">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- 活动名称 -->
                        <div class="form-group">
                            <label class="form-label required">活动名称:</label>
                            <input type="text" class="form-input" id="activityName" placeholder="请输入">
                        </div>
                        
                        <!-- 活动时间 -->
                        <div class="form-group">
                            <label class="form-label required">活动时间:</label>
                            <div class="time-input-group">
                                <input type="text" class="form-input" id="startTime" placeholder="开始时间">
                                <span class="time-separator">至</span>
                                <input type="text" class="form-input" id="endTime" placeholder="结束时间">
                            </div>
                        </div>
                        
                        <!-- 负责人 -->
                        <div class="form-group">
                            <label class="form-label required">负责人:</label>
                            <div class="form-input-wrapper">
                                <input type="text" class="form-input" id="personInCharge" placeholder="请选择">
                                <i class="fas fa-chevron-down"></i>
                            </div>
                        </div>
                        
                        <!-- 是否用工 -->
                        <div class="form-group">
                            <label class="form-label">是否用工:</label>
                            <div class="toggle-switch">
                                <input type="checkbox" id="useLabor" class="toggle-input">
                                <label for="useLabor" class="toggle-label"></label>
                            </div>
                        </div>
                        
                        <!-- 备注 -->
                        <div class="form-group">
                            <label class="form-label">备注:</label>
                            <textarea class="form-textarea" id="remarks" placeholder="请输入内容"></textarea>
                        </div>
                    </div>
                </div>
                
                <!-- AI语音输入按钮 -->
                <div class="ai-voice-button" onclick="startVoiceInput()">
                    <i class="fas fa-microphone-alt"></i>
                    <span class="ai-text">AI</span>
                </div>
                
                <!-- 底部确认按钮 -->
                <div class="mobile-footer">
                    <button class="btn btn-confirm">确定</button>
                </div>
                
                <!-- AI语音识别弹窗 -->
                <div class="ai-voice-modal" id="aiVoiceModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>AI语音识别</h3>
                            <button class="close-btn" onclick="closeVoiceModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="voice-recording" id="voiceRecording">
                                <div class="recording-animation">
                                    <div class="wave-container">
                                        <div class="wave"></div>
                                        <div class="wave"></div>
                                        <div class="wave"></div>
                                    </div>
                                </div>
                                <div class="recording-text">正在录音，请说话...</div>
                                <div class="recording-time" id="recordingTime">00:00</div>
                                
                                <!-- 实时回显文字 -->
                                <div class="realtime-text-container">
                                    <div class="realtime-text" id="realtimeText"></div>
                                </div>
                                
                                <!-- 录音控制按钮 -->
                                <div class="recording-controls">
                                    <button class="btn btn-pause" id="pauseBtn" onclick="pauseRecording()">
                                        <i class="fas fa-pause"></i>
                                        <span>暂停</span>
                                    </button>
                                    <button class="btn btn-continue" id="continueBtn" onclick="continueRecording()" style="display: none;">
                                        <i class="fas fa-play"></i>
                                        <span>继续</span>
                                    </button>
                                    <button class="btn btn-finish" id="finishBtn" onclick="finishRecording()">
                                        完成
                                    </button>
                                </div>
                            </div>
                            <div class="voice-result" id="voiceResult" style="display: none;">
                                <div class="result-header">
                                    <i class="fas fa-edit"></i>
                                    <span>识别结果</span>
                                </div>
                                <div class="result-tip">
                                    <i class="fas fa-lightbulb"></i>
                                    <span>你还可以编辑修改文字内容</span>
                                </div>
                                <div class="result-text-container">
                                    <textarea class="result-text-editable" id="resultTextEditable" placeholder="AI识别的文本将显示在这里，您可以进行编辑..."></textarea>
                                </div>
                                <div class="result-actions">
                                    <button class="btn btn-secondary" onclick="reRecord()">
                                        <i class="fas fa-microphone"></i>
                                        重新录音
                                    </button>
                                    <button class="btn btn-primary" onclick="confirmResult()">
                                        <i class="fas fa-check"></i>
                                        确认使用
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI智能解析过渡弹窗 -->
                <div class="ai-processing-modal" id="aiProcessingModal">
                    <div class="processing-content">
                        <div class="modal-header">
                            <h3>AI智能解析中</h3>
                            <button class="close-btn" onclick="hideAIProcessing()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="processing-body">
                            <ul class="timeline" id="processingTimeline">
                                <li class="step"><span class="dot"></span><span class="label">语音转文字</span></li>
                                <li class="step"><span class="dot"></span><span class="label">意图理解</span></li>
                                <li class="step"><span class="dot"></span><span class="label">实体抽取</span></li>
                                <li class="step"><span class="dot"></span><span class="label">表单映射</span></li>
                                <li class="step"><span class="dot"></span><span class="label">完成</span></li>
                            </ul>
                            <div class="variables-card">
                                <div class="vc-title"><i class="fas fa-list"></i> AI识别到的变量</div>
                                <div class="variables-list" id="extractedVariables">
                                    <!-- 变量结果将由JS填充 -->
                                </div>
                            </div>
                            <div class="countdown-section">
                                <div class="countdown-text">即将自动填充表单</div>
                                <div class="countdown-timer" id="countdownTimer">3</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    productList: {
        title: '商品列表',
        subtitle: '管理所有商品',
        content: `
            <div class="mobile-page">
                <div class="mobile-header">
                    <h1>商品列表</h1>
                    <div class="subtitle">管理所有商品</div>
                </div>
                <div class="mobile-content">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">商品管理</div>
                            <button class="btn" onclick="loadPage('product-add')">添加商品</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-tshirt"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">时尚T恤</div>
                                <div class="list-item-subtitle">库存: 156件 | 价格: ¥89</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-shoe-prints"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">运动鞋</div>
                                <div class="list-item-subtitle">库存: 89双 | 价格: ¥299</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-mobile-alt"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">智能手机</div>
                                <div class="list-item-subtitle">库存: 23台 | 价格: ¥2999</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-laptop"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">笔记本电脑</div>
                                <div class="list-item-subtitle">库存: 12台 | 价格: ¥5999</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    productAdd: {
        title: '添加商品',
        subtitle: '创建新商品',
        content: `
            <div class="mobile-page">
                <div class="mobile-header">
                    <h1>添加商品</h1>
                    <div class="subtitle">创建新商品</div>
                </div>
                <div class="mobile-content">
                    <div class="card">
                        <div class="form-group">
                            <label class="form-label">商品图片</label>
                            <div style="text-align: center; padding: 20px; border: 2px dashed #ddd; border-radius: 8px;">
                                <i class="fas fa-camera" style="font-size: 32px; color: #ccc; margin-bottom: 10px;"></i>
                                <div style="color: #666;">点击上传商品图片</div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">商品名称</label>
                            <input type="text" class="form-input" placeholder="请输入商品名称">
                        </div>
                        <div class="form-group">
                            <label class="form-label">商品分类</label>
                            <select class="form-input">
                                <option>请选择分类</option>
                                <option>服装</option>
                                <option>数码</option>
                                <option>家居</option>
                                <option>美妆</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">商品价格</label>
                            <input type="number" class="form-input" placeholder="请输入价格">
                        </div>
                        <div class="form-group">
                            <label class="form-label">库存数量</label>
                            <input type="number" class="form-input" placeholder="请输入库存数量">
                        </div>
                        <div class="form-group">
                            <label class="form-label">商品描述</label>
                            <textarea class="form-input" rows="4" placeholder="请输入商品描述"></textarea>
                        </div>
                        <button class="btn" style="width: 100%;">创建商品</button>
                    </div>
                </div>
            </div>
        `
    },
    
    orderList: {
        title: '订单列表',
        subtitle: '查看所有订单',
        content: `
            <div class="mobile-page">
                <div class="mobile-header">
                    <h1>订单列表</h1>
                    <div class="subtitle">查看所有订单</div>
                </div>
                <div class="mobile-content">
                    <div class="card">
                        <div class="list-item" onclick="loadPage('order-detail')">
                            <div class="list-item-icon">
                                <i class="fas fa-shopping-bag"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">订单 #20231201001</div>
                                <div class="list-item-subtitle">张三 | ¥299 | 待发货</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-shopping-bag"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">订单 #20231201002</div>
                                <div class="list-item-subtitle">李四 | ¥5999 | 已发货</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-shopping-bag"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">订单 #20231201003</div>
                                <div class="list-item-subtitle">王五 | ¥89 | 已完成</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-shopping-bag"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">订单 #20231201004</div>
                                <div class="list-item-subtitle">赵六 | ¥2999 | 待付款</div>
                            </div>
                            <div class="list-item-arrow">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    orderDetail: {
        title: '订单详情',
        subtitle: '订单 #20231201001',
        content: `
            <div class="mobile-page">
                <div class="mobile-header">
                    <h1>订单详情</h1>
                    <div class="subtitle">订单 #20231201001</div>
                </div>
                <div class="mobile-content">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">订单状态</div>
                        </div>
                        <div style="padding: 15px 0;">
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <div style="width: 20px; height: 20px; background: #28a745; border-radius: 50%; margin-right: 15px;"></div>
                                <div>
                                    <div style="font-weight: 500;">订单已确认</div>
                                    <div style="font-size: 12px; color: #666;">2023-12-01 10:30</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <div style="width: 20px; height: 20px; background: #28a745; border-radius: 50%; margin-right: 15px;"></div>
                                <div>
                                    <div style="font-weight: 500;">付款成功</div>
                                    <div style="font-size: 12px; color: #666;">2023-12-01 10:35</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <div style="width: 20px; height: 20px; background: #ffc107; border-radius: 50%; margin-right: 15px;"></div>
                                <div>
                                    <div style="font-weight: 500;">待发货</div>
                                    <div style="font-size: 12px; color: #666;">等待处理中</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">商品信息</div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-tshirt"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">时尚T恤</div>
                                <div class="list-item-subtitle">数量: 1件 | 价格: ¥299</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">收货信息</div>
                        </div>
                        <div style="padding: 15px 0;">
                            <div style="margin-bottom: 10px;">
                                <strong>收货人:</strong> 张三
                            </div>
                            <div style="margin-bottom: 10px;">
                                <strong>电话:</strong> 138****8888
                            </div>
                            <div>
                                <strong>地址:</strong> 北京市朝阳区某某街道某某小区1号楼101室
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">订单金额</div>
                        </div>
                        <div style="padding: 15px 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>商品金额:</span>
                                <span>¥299</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>运费:</span>
                                <span>¥0</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 18px; border-top: 1px solid #eee; padding-top: 10px;">
                                <span>总计:</span>
                                <span>¥299</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    aiServiceEffect: {
        title: '农事方案库',
        subtitle: '我的方案',
        content: `
            <div class="mobile-page aiServiceEffect-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>农事方案库</h1>
                    <div class="subtitle">我的方案</div>
                </div>
                <div class="mobile-content">
                    <!-- 主导航标签 -->
                    <div class="plan-tabs">
                        <div class="plan-tab">
                            <i class="fas fa-book"></i>
                            <span>农事方案库</span>
                        </div>
                        <div class="plan-tab active">
                            <i class="fas fa-file-alt"></i>
                            <span>我的方案</span>
                        </div>
                    </div>
                    
                    <!-- 方案卡片 -->
                    <div class="plan-card">
                        <div class="plan-header">
                            <div class="plan-title">水仙花 | 8月管理1号方案</div>
                        </div>
                        <div class="plan-details">
                            <div class="detail-row">
                                <span class="detail-label">作物种类:</span>
                                <span class="detail-value">水仙花</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">作物品种:</span>
                                <span class="detail-value">1号</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">种植面积:</span>
                                <span class="detail-value">1亩</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">指导专家:</span>
                                <span class="detail-value"></span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">所属单位:</span>
                                <span class="detail-value"></span>
                            </div>
                        </div>
                        <div class="plan-actions">
                            <button class="btn btn-primary">提交官方认证</button>
                        </div>
                    </div>
                    
                    <!-- 底部提示 -->
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                        <i class="fas fa-robot" style="color: #0aa06e; margin-right: 5px;"></i>
                        没有更多了
                    </div>
                </div>

                <!-- 悬浮添加按钮 -->
                <div class="fab">
                    <i class="fas fa-plus"></i>
                </div>
            </div>
        `
    },
    
    farmServiceRecord: {
        title: '新建农事方案',
        subtitle: '基础信息',
        content: `
            <div class="mobile-page newFarmPlan-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>新建农事方案</h1>
                    <div class="header-actions">
                        <i class="fas fa-ellipsis-v"></i>
                        <i class="fas fa-bullseye"></i>
                    </div>
                </div>
                
                <!-- 进度指示器 -->
                <div class="progress-indicator">
                    <div class="progress-step active">
                        <span class="step-number">1</span>
                        <span class="step-text">基础信息</span>
                    </div>
                    <div class="progress-arrow">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="progress-step">
                        <span class="step-number">2</span>
                        <span class="step-text">方案计划</span>
                    </div>
                </div>
                
                <div class="mobile-content">
                    <!-- AI语音输入提示 -->
                    <div class="ai-voice-tip">
                        <div class="tip-content">
                            <i class="fas fa-microphone-alt"></i>
                            <span>点击下方AI按钮，语音输入表单信息</span>
                        </div>
                        <div class="tip-examples">
                            <span class="example-title">示例：</span>
                            <span class="example-text">"我要为大厅水培植物基地的水仙花安排打药活动，时间是明天上午9点到11点，负责人是王成龙" 或 "我要创建一个水仙花种植方案，方案名称是8月管理1号方案，所在区域是大厅水培植物基地，种植面积1亩，预计亩均产量500公斤，预计亩均成本2000元，预计亩均收入3000元，指导专家是张教授，所属单位是农业技术推广站"</span>
                        </div>
                    </div>
                    
                    <div class="form-container">
                        <!-- 方案名称 -->
                        <div class="form-group">
                            <label class="form-label required">方案名称</label>
                            <input type="text" class="form-input" id="planName" placeholder="请输入">
                        </div>
                        
                        <!-- 所在地域 -->
                        <div class="form-group">
                            <label class="form-label required">所在地域</label>
                            <div class="form-input-wrapper">
                                <input type="text" class="form-input" id="location" placeholder="请选择区域">
                                <i class="fas fa-chevron-down"></i>
                            </div>
                        </div>
                        
                        <!-- 种植作物 -->
                        <div class="form-group">
                            <label class="form-label required">种植作物</label>
                            <div class="form-input-wrapper">
                                <input type="text" class="form-input" id="cropType" placeholder="请选择">
                                <button class="add-crop-btn">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- 作物品种 -->
                        <div class="form-group">
                            <label class="form-label required">作物品种</label>
                            <input type="text" class="form-input" id="cropVariety" placeholder="请输入">
                        </div>
                        
                        <!-- 种植周期 -->
                        <div class="form-group">
                            <label class="form-label required">种植周期</label>
                            <div class="time-input-group">
                                <input type="text" class="form-input" id="startTime" placeholder="开始时间">
                                <span class="time-separator">至</span>
                                <input type="text" class="form-input" id="endTime" placeholder="结束时间">
                            </div>
                        </div>
                        
                        <!-- 种植面积 -->
                        <div class="form-group">
                            <label class="form-label required">种植面积</label>
                            <input type="text" class="form-input" id="plantingArea" placeholder="请输入">
                        </div>
                        
                        <!-- 预计亩均产量 -->
                        <div class="form-group">
                            <label class="form-label required">预计亩均产量</label>
                            <div class="form-input-wrapper">
                                <input type="text" class="form-input" id="expectedYield" placeholder="请输入">
                                <span class="unit-text">kg</span>
                            </div>
                        </div>
                        
                        <!-- 预计亩均成本 -->
                        <div class="form-group">
                            <label class="form-label required">预计亩均成本</label>
                            <div class="form-input-wrapper">
                                <input type="text" class="form-input" id="expectedCost" placeholder="请输入">
                                <span class="unit-text">元</span>
                            </div>
                        </div>
                        
                        <!-- 预计亩均收入 -->
                        <div class="form-group">
                            <label class="form-label required">预计亩均收入</label>
                            <div class="form-input-wrapper">
                                <input type="text" class="form-input" id="expectedIncome" placeholder="请输入">
                                <span class="unit-text">元</span>
                            </div>
                        </div>
                        
                        <!-- 指导专家 -->
                        <div class="form-group">
                            <label class="form-label required">指导专家</label>
                            <input type="text" class="form-input" id="expert" placeholder="请输入">
                        </div>
                        
                        <!-- 所属单位 -->
                        <div class="form-group">
                            <label class="form-label required">所属单位</label>
                            <input type="text" class="form-input" id="organization" placeholder="请输入">
                        </div>
                    </div>
                </div>
                
                <!-- AI语音输入按钮 -->
                <div class="ai-voice-button" onclick="startVoiceInput()">
                    <i class="fas fa-microphone-alt"></i>
                    <span class="ai-text">AI</span>
                </div>
                
                <!-- 底部按钮 -->
                <div class="mobile-footer">
                    <button class="btn btn-next" onclick="loadPage('farmPlanStep2')">下一步</button>
                </div>
                
                <!-- AI语音识别弹窗 -->
                <div class="ai-voice-modal" id="aiVoiceModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>AI语音识别</h3>
                            <button class="close-btn" onclick="closeVoiceModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="voice-recording" id="voiceRecording">
                                <div class="recording-animation">
                                    <div class="wave-container">
                                        <div class="wave"></div>
                                        <div class="wave"></div>
                                        <div class="wave"></div>
                                    </div>
                                </div>
                                <div class="recording-text">正在录音，请说话...</div>
                                <div class="recording-time" id="recordingTime">00:00</div>
                                
                                <!-- 实时回显文字 -->
                                <div class="realtime-text-container">
                                    <div class="realtime-text" id="realtimeText"></div>
                                </div>
                                
                                <!-- 录音控制按钮 -->
                                <div class="recording-controls">
                                    <button class="btn btn-pause" id="pauseBtn" onclick="pauseRecording()">
                                        <i class="fas fa-pause"></i>
                                        <span>暂停</span>
                                    </button>
                                    <button class="btn btn-continue" id="continueBtn" onclick="continueRecording()" style="display: none;">
                                        <i class="fas fa-play"></i>
                                        <span>继续</span>
                                    </button>
                                    <button class="btn btn-finish" id="finishBtn" onclick="finishRecording()">
                                        完成
                                    </button>
                                </div>
                            </div>
                            <div class="voice-result" id="voiceResult" style="display: none;">
                                <div class="result-header">
                                    <i class="fas fa-edit"></i>
                                    <span>识别结果</span>
                                </div>
                                <div class="result-tip">
                                    <i class="fas fa-lightbulb"></i>
                                    <span>你还可以编辑修改文字内容</span>
                                </div>
                                <div class="result-text-container">
                                    <textarea class="result-text-editable" id="resultTextEditable" placeholder="AI识别的文本将显示在这里，您可以进行编辑..."></textarea>
                                </div>
                                <div class="result-actions">
                                    <button class="btn btn-secondary" onclick="reRecord()">
                                        <i class="fas fa-microphone"></i>
                                        重新录音
                                    </button>
                                    <button class="btn btn-primary" onclick="confirmResult()">
                                        <i class="fas fa-check"></i>
                                        确认使用
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI智能解析过渡弹窗 -->
                <div class="ai-processing-modal" id="aiProcessingModal">
                    <div class="processing-content">
                        <div class="modal-header">
                            <h3>AI智能解析中</h3>
                            <button class="close-btn" onclick="hideAIProcessing()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="processing-body">
                            <ul class="timeline" id="processingTimeline">
                                <li class="step"><span class="dot"></span><span class="label">语音转文字</span></li>
                                <li class="step"><span class="dot"></span><span class="label">意图理解</span></li>
                                <li class="step"><span class="dot"></span><span class="label">实体抽取</span></li>
                                <li class="step"><span class="dot"></span><span class="label">表单映射</span></li>
                                <li class="step"><span class="dot"></span><span class="label">完成</span></li>
                            </ul>
                            <div class="variables-card">
                                <div class="vc-title"><i class="fas fa-list"></i> AI识别到的变量</div>
                                <div class="variables-list" id="extractedVariables">
                                    <!-- 变量结果将由JS填充 -->
                                </div>
                            </div>
                            <div class="countdown-section">
                                <div class="countdown-text">即将自动填充表单</div>
                                <div class="countdown-timer" id="countdownTimer">3</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    farmPlanStep2: {
        title: '新建农事方案',
        subtitle: '方案计划',
        content: `
            <div class="mobile-page newFarmPlan-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>新建农事方案</h1>
                    <div class="header-actions">
                        <i class="fas fa-ellipsis-v"></i>
                        <i class="fas fa-bullseye"></i>
                    </div>
                </div>
                
                <!-- 进度指示器 -->
                <div class="progress-indicator">
                    <div class="progress-step completed">
                        <span class="step-number">1</span>
                        <span class="step-text">基础信息</span>
                    </div>
                    <div class="progress-arrow">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="progress-step active">
                        <span class="step-number">2</span>
                        <span class="step-text">方案计划</span>
                    </div>
                </div>
                
                <div class="mobile-content">
                    <!-- AI语音输入提示 -->
                    <div class="ai-voice-tip">
                        <div class="tip-content">
                            <i class="fas fa-microphone-alt"></i>
                            <span>点击下方AI按钮，语音添加农事计划</span>
                        </div>
                        <div class="tip-examples">
                            <span class="example-title">示例：</span>
                            <span class="example-text">"我要添加一个打药计划，时间是从8月18日到8月20日，农事类型是打药，活动名称是第一季度打药作业活动，作物是冬小麦，建议注意天气条件进行打药作业"</span>
                        </div>
                    </div>
                    
                    <!-- 农事方案计划标题 -->
                    <div class="plan-section-header">
                        <h3>农事方案计划</h3>
                        <button class="add-plan-btn" onclick="startVoiceInput()">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <!-- 方案计划卡片 -->
                    <div class="plan-card">
                        <div class="plan-card-header">
                            <div class="plan-date">
                                <i class="fas fa-clock"></i>
                                <span>当年08月18日~当年08月20日</span>
                            </div>
                            <div class="plan-options">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                        <div class="plan-card-content">
                            <div class="plan-detail-item">
                                <span class="detail-label">农事类型:</span>
                                <span class="detail-value">打药</span>
                            </div>
                            <div class="plan-detail-item">
                                <span class="detail-label">活动名称:</span>
                                <span class="detail-value">第一季度 | 打药作业活动</span>
                            </div>
                            <div class="plan-detail-item">
                                <span class="detail-label">作物:</span>
                                <span class="detail-value">冬小麦</span>
                            </div>
                            <div class="plan-detail-item">
                                <span class="detail-label">建议:</span>
                                <span class="detail-value">打药作业</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- AI语音输入按钮 -->
                <div class="ai-voice-button" onclick="startVoiceInput()">
                    <i class="fas fa-microphone-alt"></i>
                    <span class="ai-text">AI</span>
                </div>
                
                <!-- 底部按钮 -->
                <div class="mobile-footer">
                    <div class="footer-buttons">
                        <button class="btn btn-prev" onclick="loadPage('farmServiceRecord')">上一步</button>
                        <button class="btn btn-complete">完成</button>
                    </div>
                </div>
                
                <!-- AI语音识别弹窗 -->
                <div class="ai-voice-modal" id="aiVoiceModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>AI语音识别</h3>
                            <button class="close-btn" onclick="closeVoiceModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="voice-recording" id="voiceRecording">
                                <div class="recording-animation">
                                    <div class="wave-container">
                                        <div class="wave"></div>
                                        <div class="wave"></div>
                                        <div class="wave"></div>
                                    </div>
                                </div>
                                <div class="recording-text">正在录音，请说话...</div>
                                <div class="recording-time" id="recordingTime">00:00</div>
                                
                                <!-- 实时回显文字 -->
                                <div class="realtime-text-container">
                                    <div class="realtime-text" id="realtimeText"></div>
                                </div>
                                
                                <!-- 录音控制按钮 -->
                                <div class="recording-controls">
                                    <button class="btn btn-pause" id="pauseBtn" onclick="pauseRecording()">
                                        <i class="fas fa-pause"></i>
                                        <span>暂停</span>
                                    </button>
                                    <button class="btn btn-continue" id="continueBtn" onclick="continueRecording()" style="display: none;">
                                        <i class="fas fa-play"></i>
                                        <span>继续</span>
                                    </button>
                                    <button class="btn btn-finish" id="finishBtn" onclick="finishRecording()">
                                        完成
                                    </button>
                                </div>
                            </div>
                            <div class="voice-result" id="voiceResult" style="display: none;">
                                <div class="result-header">
                                    <i class="fas fa-edit"></i>
                                    <span>识别结果</span>
                                </div>
                                <div class="result-tip">
                                    <i class="fas fa-lightbulb"></i>
                                    <span>你还可以编辑修改文字内容</span>
                                </div>
                                <div class="result-text-container">
                                    <textarea class="result-text-editable" id="resultTextEditable" placeholder="AI识别的文本将显示在这里，您可以进行编辑..."></textarea>
                                </div>
                                <div class="result-actions">
                                    <button class="btn btn-secondary" onclick="reRecord()">
                                        <i class="fas fa-microphone"></i>
                                        重新录音
                                    </button>
                                    <button class="btn btn-primary" onclick="confirmResult()">
                                        <i class="fas fa-check"></i>
                                        确认使用
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI智能解析过渡弹窗 -->
                <div class="ai-processing-modal" id="aiProcessingModal">
                    <div class="processing-content">
                        <div class="modal-header">
                            <h3>AI智能解析中</h3>
                            <button class="close-btn" onclick="hideAIProcessing()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="processing-body">
                            <ul class="timeline" id="processingTimeline">
                                <li class="step"><span class="dot"></span><span class="label">语音转文字</span></li>
                                <li class="step"><span class="dot"></span><span class="label">意图理解</span></li>
                                <li class="step"><span class="dot"></span><span class="label">实体抽取</span></li>
                                <li class="step"><span class="dot"></span><span class="label">计划创建</span></li>
                                <li class="step"><span class="dot"></span><span class="label">完成</span></li>
                            </ul>
                            <div class="variables-card">
                                <div class="vc-title"><i class="fas fa-list"></i> AI识别到的变量</div>
                                <div class="variables-list" id="extractedVariables">
                                    <!-- 变量结果将由JS填充 -->
                                </div>
                            </div>
                            <div class="countdown-section">
                                <div class="countdown-text">即将自动创建农事计划</div>
                                <div class="countdown-timer" id="countdownTimer">3</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    userAnalytics: {
        title: '用户分析',
        subtitle: '用户行为数据分析',
        content: `
            <div class="mobile-page">
                <div class="mobile-header">
                    <h1>用户分析</h1>
                    <div class="subtitle">用户行为数据分析</div>
                </div>
                <div class="mobile-content">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">1,234</div>
                            <div class="stat-label">总用户数</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">567</div>
                            <div class="stat-label">活跃用户</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">89.2%</div>
                            <div class="stat-label">用户留存率</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">4.5</div>
                            <div class="stat-label">平均使用时长(小时)</div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">用户增长</div>
                        </div>
                        <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #666;">
                            <div style="text-align: center;">
                                <i class="fas fa-chart-area" style="font-size: 48px; margin-bottom: 10px; color: #ccc;"></i>
                                <div>用户增长趋势图</div>
                                <div style="font-size: 12px; margin-top: 5px;">（演示用图表占位）</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">用户分布</div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">北京</div>
                                <div class="list-item-subtitle">用户数: 234人 (19%)</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">上海</div>
                                <div class="list-item-subtitle">用户数: 189人 (15%)</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">广州</div>
                                <div class="list-item-subtitle">用户数: 156人 (13%)</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">
                                <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="list-item-content">
                                <div class="list-item-title">深圳</div>
                                <div class="list-item-subtitle">用户数: 145人 (12%)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },

    fieldWorkstation: {
        title: '田间工作站',
        subtitle: '投入品使用成效核查配置',
        content: `
            <div class="mobile-page fieldWorkstation-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>投入品使用成效核查配置</h1>
                </div>
                <div class="mobile-content">
                    <!-- 配置开关 -->
                    <div class="card">
                        <div class="config-row">
                            <span class="config-label">投入品使用成效核查配置开关</span>
                            <div class="config-switch active">
                                <span>已开启</span>
                                <div class="switch-toggle"></div>
                            </div>
                        </div>
                    </div>

                    <!-- 核查方式 -->
                    <div class="card">
                        <div class="section-title">投入品使用结果核查方式</div>
                        <div class="radio-group">
                            <div class="radio-item active">
                                <div class="radio-circle"></div>
                                <span>随机生成多点监测</span>
                            </div>
                            <div class="radio-item">
                                <div class="radio-circle"></div>
                                <span>田间摄像头拍照</span>
                            </div>
                        </div>
                        <div class="selected-method">
                            <i class="fas fa-circle"></i>
                            <span>随机生成多点监测</span>
                        </div>
                    </div>

                    <!-- 土壤肥力检测要求 -->
                    <div class="card">
                        <div class="section-title">
                            <i class="fas fa-circle" style="color: #0aa06e; font-size: 8px; margin-right: 8px;"></i>
                            土壤肥力检测要求
                            <button class="ai-btn" onclick="showAIDialog('soil')">
                                <i class="fas fa-robot"></i>
                                AI设定要求
                            </button>
                        </div>
                        
                        <div class="config-section">
                            <div class="config-text">施肥农事活动结束后,第 <input type="number" class="config-input" value="7"> 天,进行 土壤肥力检测</div>
                            
                            <div class="config-row">
                                <span class="config-label">土壤测肥任务开始时间:</span>
                                <div class="time-input">
                                    <span>选择时间</span>
                                    <i class="fas fa-clock"></i>
                                </div>
                            </div>
                            
                            <div class="config-row">
                                <span class="config-label">土壤测肥任务截止时限:</span>
                                <div class="time-input">
                                    <input type="number" class="config-input" value="0" style="width: 40px;">
                                    <span>小时</span>
                                </div>
                            </div>
                            
                            <div class="config-row">
                                <span class="config-label">生成土壤测肥点位数量</span>
                                <div class="time-input">
                                    <input type="number" class="config-input" style="width: 40px;">
                                    <span>个</span>
                                </div>
                            </div>
                            
                            <div class="config-row">
                                <span class="config-label">土壤测肥点位有效区域</span>
                                <div class="time-input">
                                    <input type="number" class="config-input" style="width: 40px;">
                                    <span>米(以内)</span>
                                </div>
                            </div>
                            
                            <div class="config-row">
                                <span class="config-label">肥力指标</span>
                                <button class="btn-custom">自定义指标+</button>
                            </div>
                            
                            <div class="indicator-list">
                                <div class="indicator-item">
                                    <span>氮</span>
                                    <div class="switch-toggle"></div>
                                </div>
                                <div class="indicator-item">
                                    <span>磷</span>
                                    <div class="switch-toggle"></div>
                                </div>
                                <div class="indicator-item">
                                    <span>钾</span>
                                    <div class="switch-toggle"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 作物长势拍照要求 -->
                    <div class="card">
                        <div class="section-title">
                            <i class="fas fa-circle" style="color: #0aa06e; font-size: 8px; margin-right: 8px;"></i>
                            作物长势拍照要求
                            <button class="ai-btn" onclick="showAIDialog('crop')">
                                <i class="fas fa-robot"></i>
                                AI设定要求
                            </button>
                        </div>
                        
                        <div class="config-section">
                            <div class="config-text">农事活动结束后,第 <input type="number" class="config-input" value="0"> 天,进行作物 长势拍照</div>
                            
                            <div class="config-row">
                                <span class="config-label">长势拍照任务开始时间:</span>
                                <div class="time-input">
                                    <span>07:00</span>
                                    <i class="fas fa-clock"></i>
                                </div>
                            </div>
                            
                            <div class="config-row">
                                <span class="config-label">长势拍照任务截止时限:</span>
                                <div class="time-input">
                                    <input type="number" class="config-input" value="1" style="width: 40px;">
                                    <span>小时</span>
                                </div>
                            </div>
                            
                            <div class="config-row">
                                <span class="config-label">生成拍照打卡点位数量</span>
                                <div class="time-input">
                                    <input type="number" class="config-input" value="2" style="width: 40px;">
                                    <span>个</span>
                                </div>
                            </div>
                            
                            <div class="config-row">
                                <span class="config-label">拍照打卡点位有效区域</span>
                                <div class="time-input">
                                    <input type="number" class="config-input" value="20" style="width: 40px;">
                                    <span>米(以内)</span>
                                </div>
                            </div>
                            
                            <div class="config-row">
                                <span class="config-label">每个点位拍照数量</span>
                                <div class="time-input">
                                    <input type="number" class="config-input" value="1" style="width: 40px;">
                                    <span>张(含)以上</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 底部按钮 -->
                <div class="mobile-footer action-footer">
                    <button class="btn btn-secondary">取消</button>
                    <button class="btn">确定</button>
                </div>

                <!-- AI设定弹窗 -->
                <div class="ai-dialog" id="aiDialog">
                    <div class="ai-dialog-content">
                        <div class="ai-dialog-header">
                            <h3><i class="fas fa-robot"></i> AI智能设定</h3>
                            <button class="ai-close" onclick="hideAIDialog()">×</button>
                        </div>
                        <div class="ai-dialog-body">
                            <div class="ai-section">
                                <h4>基础信息</h4>
                                <div class="ai-form-group">
                                    <label>作物类型:</label>
                                    <input type="text" id="cropType" value="小麦" disabled class="disabled-input">
                                </div>
                                <div class="ai-form-group">
                                    <label>地理坐标:</label>
                                    <input type="text" id="location" value="商丘市 柘城县 牛城乡 大运村" disabled class="disabled-input">
                                </div>
                                <div class="ai-form-group">
                                    <label>种植方案:</label>
                                    <select id="plantingPlan">
                                        <option value="standard">标准种植</option>
                                        <option value="intensive">密集种植</option>
                                        <option value="organic">有机种植</option>
                                    </select>
                                </div>
                            </div>
                            <div class="ai-section">
                                <h4>AI分析结果</h4>
                                <div class="ai-analysis" id="aiAnalysis">
                                    <div class="ai-loading">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        正在分析...
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="ai-dialog-footer">
                            <button class="btn btn-secondary" onclick="hideAIDialog()">取消</button>
                            <button class="btn" onclick="applyAISettings()">应用设定</button>
                        </div>
                    </div>
                </div>
            </div>
        `
    },

    farmCalendar: {
        title: '农事日历',
        subtitle: '农事活动管理',
        content: `
            <div class="mobile-page farmCalendar-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>农事日历</h1>
                </div>
                <div class="mobile-content">
                    <!-- 日历导航 -->
                    <div class="calendar-nav">
                        <div class="calendar-header">
                            <i class="fas fa-chevron-left"></i>
                            <span>2025/08</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                        
                        <!-- 星期标题 -->
                        <div class="weekdays">
                            <div class="weekday">日</div>
                            <div class="weekday">一</div>
                            <div class="weekday">二</div>
                            <div class="weekday">三</div>
                            <div class="weekday">四</div>
                            <div class="weekday">五</div>
                            <div class="weekday">六</div>
                        </div>
                        
                        <!-- 日期显示 -->
                        <div class="date-row">
                            <div class="date-item">
                                <div class="date-number">10</div>
                                <div class="date-text">十七</div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">11</div>
                                <div class="date-text">十八</div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">12</div>
                                <div class="date-text">十九</div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">13</div>
                                <div class="date-text">二十</div>
                            </div>
                            <div class="date-item today">
                                <div class="date-number">14</div>
                                <div class="date-text">今日</div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">15</div>
                                <div class="date-text">廿二</div>
                            </div>
                            <div class="date-item">
                                <div class="date-number">16</div>
                                <div class="date-text">廿三</div>
                            </div>
                        </div>
                        
                        <div class="calendar-expand">
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>

                    <!-- 农事活动列表 -->
                    <div class="activities-section">
                        <h3>农事活动</h3>
                        
                        <!-- 活动卡片1 -->
                        <div class="activity-card">
                            <div class="activity-header">
                                <div class="activity-tag spraying">打药</div>
                                <div class="activity-title">打药</div>
                                <div class="activity-menu">
                                    <i class="fas fa-ellipsis-v"></i>
                                </div>
                            </div>
                            <div class="activity-details">
                                <div class="detail-item">
                                    <span class="detail-label">种植计划:</span>
                                    <span class="detail-value">打药</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">作物/品种:</span>
                                    <span class="detail-value">水仙花(1号)</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">基地/地块:</span>
                                    <span class="detail-value">大厅水培植物|一号分区|一号基地 (水培区|一号地块)</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">农事时间:</span>
                                    <span class="detail-value">2025-08-12~2025-08-12</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">负责人:</span>
                                    <span class="detail-value">王成龙</span>
                                </div>
                            </div>
                            <div class="activity-status completed">
                                <div class="status-stamp">已完成</div>
                            </div>
                        </div>

                        <!-- 活动卡片2 -->
                        <div class="activity-card" onclick="loadPage('farmActivityDetail')">
                            <div class="activity-header">
                                <div class="activity-tag spraying">打药</div>
                                <div class="activity-title">打药测试1</div>
                                <div class="activity-menu">
                                    <i class="fas fa-ellipsis-v"></i>
                                </div>
                            </div>
                            <div class="activity-details">
                                <div class="detail-item">
                                    <span class="detail-label">种植计划:</span>
                                    <span class="detail-value">打药</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">作物/品种:</span>
                                    <span class="detail-value">水仙花(1号)</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">基地/地块:</span>
                                    <span class="detail-value">大厅水培植物|一号分区|一号基地 (水培区|一号地块)</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">农事时间:</span>
                                    <span class="detail-value">2025-08-13~2025-08-13</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">负责人:</span>
                                    <span class="detail-value">王成龙</span>
                                </div>
                                <div class="detail-item">
                                    <div class="after-photo-entry">
                                        <i class="fas fa-camera"></i>
                                        <span>服务后拍照</span>
                                    </div>
                                </div>
                            </div>
                            <div class="activity-status completed">
                                <div class="status-stamp">已完成</div>
                            </div>
                        </div>

                        <!-- 活动卡片3 -->
                        <div class="activity-card">
                            <div class="activity-header">
                                <div class="activity-tag weeding">除草</div>
                                <div class="activity-title">除草</div>
                                <div class="activity-menu">
                                    <i class="fas fa-ellipsis-v"></i>
                                </div>
                            </div>
                            <div class="activity-details">
                                <div class="detail-item">
                                    <span class="detail-label">种植计划:</span>
                                    <span class="detail-value">打药</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">作物/品种:</span>
                                    <span class="detail-value">水仙花(1号)</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">基地/地块:</span>
                                    <span class="detail-value">大厅水培植物|一号分区|一号基地 (水培区|一号地块)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 浮动添加按钮 -->
                <div class="fab">
                    <i class="fas fa-plus"></i>
                </div>
            </div>
        `
    },

    farmActivityDetail: {
        title: '农事活动详情',
        subtitle: '打药测试1',
        content: `
            <div class="mobile-page farmActivityDetail-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
                    <h1>农事活动详情</h1>
                </div>
                <div class="mobile-content">
                    <!-- 活动摘要卡片（截图样式） -->
                    <div class="activity-summary">
                        <div class="summary-top">
                            <span class="activity-tag spraying">打药</span>
                            <span style="color:#666;">2025-08-13~2025-08-13</span>
                        </div>
                        <div class="summary-title">打药测试1</div>
                        <div class="summary-list">
                            <div class="detail-item"><span class="detail-label">基地/地块：</span><span class="detail-value">大厅水培植物 | 一号分区 | 一号基地(水培区 | 一号地块)</span></div>
                            <div class="detail-item"><span class="detail-label">种植计划：</span><span class="detail-value">打药</span></div>
                            <div class="detail-item"><span class="detail-label">负责人：</span><span class="detail-value">王成龙</span></div>
                            <div class="detail-item"><span class="detail-label">备注：</span><span class="detail-value"></span></div>
                        </div>
                    </div>
                    <!-- 农事照片 -->
                    <div class="detail-section">
                        <div class="section-header">
                            <i class="fas fa-mountain"></i>
                            <h3>农事照片</h3>
                        </div>
                        <div class="photo-upload">
                            <div class="photo-item">
                                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNEZBRjUwIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" alt="农事照片">
                                <div class="photo-remove">
                                    <i class="fas fa-times"></i>
                                </div>
                            </div>
                            <div class="photo-add">
                                <i class="fas fa-plus"></i>
                            </div>
                        </div>
                    </div>

                    <!-- 上传农事视频 -->
                    <div class="detail-section">
                        <div class="section-header">
                            <i class="fas fa-play"></i>
                            <h3>上传农事视频</h3>
                        </div>
                        <div class="video-upload">
                            <div class="video-item">
                                <div class="video-thumbnail">
                                    <i class="fas fa-play"></i>
                                    <span class="video-duration">00:02</span>
                                </div>
                                <div class="video-remove">
                                    <i class="fas fa-times"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 投入品使用成效监管 -->
                    <div class="detail-section">
                        <div class="section-header">
                            <i class="fas fa-chart-line"></i>
                            <h3>投入品使用成效监管: 人工拍照</h3>
                        </div>
                        <div class="monitoring-items">
                            <div class="monitoring-item">
                                <div class="monitoring-content">
                                    <span>现场工作人员已完成农事活动前的拍照任务</span>
                                    <button class="btn btn-small">查看</button>
                                </div>
                            </div>
                            <div class="monitoring-item">
                                <div class="monitoring-content">
                                    <span>现场工作人员<span class="highlight">超时未完成</span>农事活动后的拍照任务</span>
                                    <button class="btn btn-small">查看</button>
                                </div>
                            </div>
                            <div class="monitoring-item ai-service-item" onclick="loadPage('aiServiceEffect')">
                                <div class="monitoring-content">
                                    <div class="ai-service-content">
                                        <i class="fas fa-brain ai-service-icon"></i>
                                        <span>经AI技术对比分析,整体效果提升: <span class="effect-highlight">90%</span></span>
                                        <div class="ai-service-entry">
                                            <span class="ai-entry-text">查看AI服务成效</span>
                                            <i class="fas fa-arrow-right"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 农事活动描述 -->
                    <div class="detail-section">
                        <div class="section-header">
                            <h3>农事活动描述</h3>
                        </div>
                        <div class="activity-description">
                            <span>测试1</span>
                        </div>
                    </div>
                </div>
                <div class="mobile-footer">
                    <button class="btn" style="width:100%;">保存</button>
                </div>
            </div>
        `
    },
    
    // 气象灾害智能体主页
    weatherDisasterHome: {
        title: '气象灾害预警',
        subtitle: '地块级气象预警',
        content: `
            <div class="mobile-page weather-disaster-home-page">
                <div class="mobile-header weather-header">
                    <button class="back-btn" onclick="goBack()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="header-title">
                        <h1>气象灾害预警</h1>
                    </div>
                </div>
                <div class="mobile-content weather-home-content">
                    <!-- 历史记录按钮 -->
                    <div class="history-btn-container">
                        <button class="history-btn" onclick="showComingSoon('历史记录')">
                            <i class="fas fa-history"></i>
                        </button>
                    </div>
                    
                    <!-- AI Logo 和欢迎文字 -->
                    <div class="ai-welcome-section">
                        <div class="ai-logo weather-logo">
                            <i class="fas fa-cloud-sun-rain"></i>
                        </div>
                        <p class="ai-greeting">您好，我是气象灾害预警专家，为您提供地块级精准气象预警和智能农事决策建议......</p>
                        <button class="examples-btn" onclick="showWeatherExamplesModal()">
                            <i class="fas fa-lightbulb"></i>
                            <span>例子</span>
                        </button>
                    </div>

                    <!-- 输入区域 -->
                    <div class="ai-input-section">
                        <div class="ai-input-container">
                            <textarea id="weatherHomeInput" class="ai-textarea" placeholder="输入您的问题，例如：柘城县未来7天天气如何？" rows="5"></textarea>
                            <div class="ai-input-actions">
                                <button class="voice-btn" onclick="showComingSoon('语音录入')">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <button class="camera-btn" onclick="takeWeatherPhoto()">
                                    <i class="fas fa-camera"></i>
                                </button>
                                <button class="send-btn" onclick="startWeatherHomeChat()">
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 快速访问智能体 -->
                    <div class="recommended-agents weather-quick-access">
                        <div class="agents-hint">快速访问</div>
                        <div class="agents-grid">
                            <div class="agent-card weather-briefing-card" onclick="loadWeatherDisasterAgent()">
                                <i class="fas fa-file-alt"></i>
                                <span>气象预警简报</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `
    },
    
    // 气象灾害简报页面（原气象灾害智能体）
    weatherDisasterAgent: {
        title: '地块气象灾害预报',
        subtitle: '地块级气象预警',
        content: `
            <div class="mobile-page weather-disaster-page">
                <div class="mobile-header weather-header">
                    <button class="back-btn" onclick="goBack()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="header-title">
                        <h1>地块气象灾害预报</h1>
                    </div>
                </div>
                <div class="weather-content" id="weatherContent">
                    <div class="weather-messages-container" id="weatherMessagesContainer">
                        <div class="weather-messages" id="weatherMessages">
                            <!-- 消息将通过JavaScript动态添加 -->
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    
    // 气象详情页面
    weatherDetail: {
        title: '地块气象灾害分析报告',
        subtitle: '',
        content: `
            <div class="mobile-page weather-detail-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="header-title">
                        <h1>地块气象灾害分析报告</h1>
                    </div>
                    <button class="share-btn" onclick="showShareOptions()">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
                <div class="weather-detail-content" id="weatherDetailContent">
                    <!-- 内容将通过JavaScript动态生成 -->
                </div>
            </div>
        `
    },
    
    // 城市气象灾害预警报告页面
    weatherReport: {
        title: '城市气象灾害预警报告',
        subtitle: '',
        content: `
            <div class="mobile-page weather-report-page">
                <div class="mobile-header">
                    <button class="back-btn" onclick="goBack()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="header-title">
                        <h1>城市气象灾害预警报告</h1>
                    </div>
                    <button class="share-btn" id="weatherReportShareBtn" onclick="shareWeatherReport()" style="display:none;">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
                <div class="weather-report-content" id="weatherReportContent">
                    <!-- 内容将通过JavaScript动态生成 -->
                </div>
            </div>
        `
    }
};
let currentPage = 'home';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载首页
    loadPage('home');
    
    // 绑定导航事件
    bindNavigationEvents();
    
    // 绑定侧边栏切换事件
    bindSidebarToggle();
    
    // 初始化语音识别
    initSpeechRecognition();
});

// 绑定导航事件
function bindNavigationEvents() {
    // 主菜单项点击事件
    document.querySelectorAll('.nav-item.main-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            // 如果有子菜单，切换展开状态
            const subMenu = this.nextElementSibling;
            if (subMenu && subMenu.classList.contains('sub-menu')) {
                this.classList.toggle('expanded');
                subMenu.classList.toggle('expanded');
            } else {
                // 没有子菜单，直接加载页面
                if (page) {
                    // 左侧主菜单点击 AI 时跳转到新AI中心默认页
                    if (page === 'ai') {
                        loadPage('aiChatCenter');
                    } else {
                        loadPage(page);
                    }
                }
            }
        });
    });
    
    // 子菜单项点击事件
    document.querySelectorAll('.nav-item.sub-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            loadPage(page);
        });
    });
    
    // 底部导航点击事件
    document.addEventListener('click', function(e) {
        if (e.target.closest('.tab-item')) {
            const tabItem = e.target.closest('.tab-item');
            const page = tabItem.getAttribute('data-page');
            
            if (page) {
                // 更新活跃状态
                document.querySelectorAll('.tab-item').forEach(item => {
                    item.classList.remove('active');
                });
                tabItem.classList.add('active');
                
                // 加载页面
                if (page === 'mall') {
                    loadPage('mall');
                } else if (page === 'ai') {
                    loadPage('aiChatCenter');
                } else if (page === 'workbench') {
                    loadPage('workbench');
                } else {
                    loadPage(page);
                }
            }
        }
    });
}

// 绑定侧边栏切换事件
function bindSidebarToggle() {
    const toggleBtn = document.getElementById('toggleBtn');
    const sidebar = document.getElementById('sidebar');
    
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // 更新按钮图标
        const icon = this.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.className = 'fas fa-chevron-right';
        } else {
            icon.className = 'fas fa-bars';
        }
    });
}

// 内联AI诊断功能初始化
function setupInlineAIDiagnosis() {
    console.log('Setting up inline AI diagnosis...');
    
    const uploadTrigger = document.getElementById('embeddedUploadTrigger');
    const imageInput = document.getElementById('embeddedImageInput');
    const textarea = document.getElementById('inlineQuestionTextarea');
    const diagnosisBtn = document.getElementById('btnStartDiagnosis');
    
    if (!uploadTrigger || !imageInput || !textarea || !diagnosisBtn) {
        console.error('Inline AI diagnosis elements not found');
        return;
    }
    
    console.log('Inline elements found, setting up events...');
    
    // 图片上传功能
    uploadTrigger.onclick = function() {
        console.log('Embedded upload trigger clicked');
        imageInput.click();
    };
    
    imageInput.onchange = function(e) {
        console.log('Inline files selected:', e.target.files.length);
        const files = e.target.files;
        if (files.length > 0) {
            handleInlineImageFiles(files);
        }
    };
    
    // 文字输入功能
    textarea.oninput = function() {
        updateSendButton();
    };
    
    // 初始化发送按钮状态
    updateSendButton();
}

// 处理内联图片文件
function handleInlineImageFiles(files) {
    console.log('Handling inline image files:', files.length);
    
    const imagePreview = document.getElementById('embeddedImagePreview');
    
    if (files.length === 0) return;
    
    // 清空之前的图片
    if (imagePreview) imagePreview.innerHTML = '';
    
    // 处理每个文件
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageItem = createEmbeddedImagePreview(e.target.result, file.name, index);
                if (imagePreview) imagePreview.appendChild(imageItem);
            };
            reader.readAsDataURL(file);
        }
    });
    
    updateSendButton();
}

// 创建内嵌图片预览
function createEmbeddedImagePreview(src, name, index) {
    const imageItem = document.createElement('div');
    imageItem.className = 'embedded-image-item';
    imageItem.innerHTML = `
        <img src="${src}" alt="${name}">
        <button class="embedded-remove-btn" onclick="removeEmbeddedImage(${index})">
            <i class="fas fa-times"></i>
        </button>
    `;
    return imageItem;
}

// 移除内嵌图片
function removeEmbeddedImage(index) {
    const imagePreview = document.getElementById('embeddedImagePreview');
    const imageItems = imagePreview.querySelectorAll('.embedded-image-item');
    
    if (imageItems[index]) {
        imageItems[index].remove();
    }
    
    updateSendButton();
}

// 更新发送按钮状态
function updateSendButton() {
    const textarea = document.getElementById('inlineQuestionTextarea');
    const imagePreview = document.getElementById('embeddedImagePreview');
    const diagnosisBtn = document.getElementById('btnStartDiagnosis');
    
    if (!textarea || !diagnosisBtn) return;
    
    const hasText = textarea.value.trim().length > 0;
    const hasImages = imagePreview && imagePreview.children.length > 0;
    
    // 有文字或图片就可以发送
    if (hasText || hasImages) {
        diagnosisBtn.classList.add('active');
        diagnosisBtn.disabled = false;
    } else {
        diagnosisBtn.classList.remove('active');
        diagnosisBtn.disabled = true;
    }
}

// 开始内联诊断
function startInlineDiagnosis() {
    const textarea = document.getElementById('inlineQuestionTextarea');
    const imagePreview = document.getElementById('embeddedImagePreview');
    
    const questionText = textarea ? textarea.value.trim() : '';
    const hasImages = imagePreview && imagePreview.children.length > 0;
    
    if (!questionText && !hasImages) {
        showInlineNotification('请输入问题或上传图片', 'warning');
        return;
    }
    
    console.log('Starting inline diagnosis...');
    console.log('Question:', questionText);
    console.log('Has images:', hasImages);
    
    // 收集用户输入数据
    const userInput = {
        text: questionText,
        images: hasImages ? Array.from(uploadedImages.querySelectorAll('img')).map(img => img.src) : []
    };
    
    // 将用户输入数据存储到全局变量
    window.currentDiagnosisData = userInput;
    
    // 跳转到AI诊断页面并直接开始诊断
    loadPage('aiDiagnosis');
}

// 显示内联通知
function showInlineNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `inline-notification inline-notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 插入到AI卡片中
    const aiCard = document.querySelector('.ai-diagnosis-card');
    if (aiCard) {
        aiCard.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// 显示用户输入内容摘要
function displayUserInputSummary(userInput) {
    const summaryImages = document.getElementById('summaryImages');
    const summaryText = document.getElementById('summaryText');
    
    if (!summaryImages || !summaryText) {
        console.error('Summary elements not found');
        return;
    }
    
    console.log('Displaying user input summary:', userInput);
    
    // 显示图片
    if (userInput.images && userInput.images.length > 0) {
        summaryImages.innerHTML = userInput.images.map(imageSrc => `
            <div class="summary-image-item">
                <img src="${imageSrc}" alt="用户上传的图片" />
            </div>
        `).join('');
        summaryImages.style.display = 'flex';
    } else {
        summaryImages.style.display = 'none';
    }
    
    // 显示文字描述
    if (userInput.text && userInput.text.trim()) {
        summaryText.innerHTML = `
            <div class="summary-text-content">
                <div class="summary-text-label">问题描述：</div>
                <div class="summary-text-value">${userInput.text}</div>
            </div>
        `;
        summaryText.style.display = 'block';
    } else {
        summaryText.style.display = 'none';
    }
}

// AI诊断相关函数
function showAIDiagnosis() {
    console.log('Loading AI new chat page...');
    loadPage('aiNewChat');
}

// 提交AI诊断（原型）
window.submitNewConversation = function() {
    const text = document.getElementById('inlineQuestionTextarea')?.value || '';
    const conv = createConversation({ title: 'AI诊断', inputText: text, images: [] });
    // 简单模拟：立即跳转诊断详情并开始进度
    loadPage('aiDiagnosis');
    setTimeout(() => {
        // 绑定会话并开始模拟
        setConversationStatus(conv.id, 'running');
        simulateDiagnosisFor(conv.id);
    }, 50);
};

function simulateDiagnosisFor(id){
    // 让现有进度条动完后设置done
    setTimeout(()=> setConversationStatus(id, 'done'), 5500);
}

// 历史对话渲染与筛选（原型）
window.filterHistory = function(keyword='') {
    const wrap = document.getElementById('historyList');
    if (!wrap) return;
    const items = conversationStore.list.filter(c =>
        (c.title||'').includes(keyword) || (c.inputText||'').includes(keyword)
    );
    wrap.innerHTML = items.map(c => `
        <div class="card chat-item" onclick="openConversation('${c.id}')">
            <div class="chat-title">${c.inputText?.slice(0, 12) || 'AI诊断'}</div>
            <div class="chat-sub">${c.createdAt} · ${c.status}</div>
        </div>
    `).join('') || '<div class="card" style="text-align:center;color:#999;">暂无历史会话</div>';
};

window.openConversation = function(id){
    conversationStore.currentId = id;
    loadPage('aiDiagnosis');
};

// 加载专家详情数据
function loadExpertDetail(expertId) {
    const expert = expertData[expertId];
    if (!expert) return;
    
    // 更新专家基本信息
    const nameEl = document.getElementById('expertName');
    if (nameEl) nameEl.textContent = expert.name;
    
    const specialtiesEl = document.getElementById('expertSpecialties');
    if (specialtiesEl) {
        specialtiesEl.innerHTML = expert.specialties.map(s => `<span class="tag">${s}</span>`).join('');
    }
    
    const backgroundEl = document.getElementById('expertBackground');
    if (backgroundEl) backgroundEl.textContent = expert.background;
    
    // 更新知识库服务
    const knowledgeEl = document.getElementById('knowledgeItems');
    if (knowledgeEl) {
        knowledgeEl.innerHTML = expert.knowledge.map(item => `
            <div class="knowledge-item">
                <div class="knowledge-title">${item.title}</div>
                <div class="knowledge-desc">${item.desc}</div>
                <div class="knowledge-price">${item.price}</div>
            </div>
        `).join('');
    }
    
    // 更新推荐产品
    const productsEl = document.getElementById('productItems');
    if (productsEl) {
        productsEl.innerHTML = expert.products.map(item => `
            <div class="product-item">
                <div class="product-name">${item.name}</div>
                <div class="product-desc">${item.desc}</div>
                <div class="product-tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="product-price">${item.price}</div>
                <button class="btn-buy">立即购买</button>
            </div>
        `).join('');
    }
}

// 设置图片上传功能
function setupImageUpload() {
    console.log('Setting up image upload...');
    
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    
    if (!uploadArea || !imageInput) {
        console.error('Upload elements not found');
        return;
    }
    
    console.log('Upload elements found, setting up events...');
    
    // 点击上传区域触发文件选择
    uploadArea.onclick = function() {
        console.log('Upload area clicked');
        imageInput.click();
    };
    
    // 文件选择处理
    imageInput.onchange = function(e) {
        console.log('Files selected:', e.target.files.length);
        const files = e.target.files;
        if (files.length > 0) {
            handleImageFiles(files);
        }
    };
    
    // 拖拽上传
    uploadArea.ondragover = function(e) {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    };
    
    uploadArea.ondragleave = function() {
        uploadArea.classList.remove('drag-over');
    };
    
    uploadArea.ondrop = function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        console.log('Files dropped:', files.length);
        if (files.length > 0) {
            handleImageFiles(files);
        }
    };
}

// 处理图片文件
function handleImageFiles(files) {
    console.log('Handling image files:', files.length);
    
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadedImages = document.getElementById('uploadedImages');
    const questionInputCard = document.getElementById('questionInputCard');
    
    if (files.length === 0) {
        console.log('No files to process');
        return;
    }
    
    // 隐藏占位符，显示图片预览区域
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
    if (uploadedImages) uploadedImages.style.display = 'block';
    
    // 清空之前的图片
    uploadedImages.innerHTML = '';
    
    // 处理每个文件
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageItem = createImagePreview(e.target.result, file.name, index);
                uploadedImages.appendChild(imageItem);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 显示问题输入区域
    if (questionInputCard) {
        questionInputCard.style.display = 'block';
        questionInputCard.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 检查是否可以开始诊断
    checkCanStartDiagnosis();
}

// 创建图片预览
function createImagePreview(src, name, index) {
    const imageItem = document.createElement('div');
    imageItem.className = 'image-preview-item';
    imageItem.innerHTML = `
        <div class="image-preview">
            <img src="${src}" alt="${name}">
            <div class="image-overlay">
                <div class="image-name">${name}</div>
                <button class="btn-remove-image" onclick="removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    return imageItem;
}

// 移除图片
function removeImage(index) {
    const uploadedImages = document.getElementById('uploadedImages');
    const imageItems = uploadedImages.querySelectorAll('.image-preview-item');
    
    if (imageItems[index]) {
        imageItems[index].remove();
    }
    
    // 如果没有图片了，显示占位符
    if (uploadedImages.children.length === 0) {
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const questionInputCard = document.getElementById('questionInputCard');
        const startDiagnosisCard = document.getElementById('startDiagnosisCard');
        
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
        uploadedImages.style.display = 'none';
        if (questionInputCard) questionInputCard.style.display = 'none';
        if (startDiagnosisCard) startDiagnosisCard.style.display = 'none';
    }
    
    checkCanStartDiagnosis();
}

// 设置文字输入功能
function setupTextInput() {
    console.log('Setting up text input...');
    
    const textarea = document.getElementById('questionTextarea');
    const charCount = document.getElementById('charCount');
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    
    if (!textarea || !charCount) {
        console.error('Text input elements not found');
        return;
    }
    
    console.log('Text input elements found, setting up events...');
    
    // 字符计数
    textarea.oninput = function() {
        const length = textarea.value.length;
        charCount.textContent = length;
        
        if (length > 500) {
            textarea.value = textarea.value.substring(0, 500);
            charCount.textContent = 500;
        }
        
        checkCanStartDiagnosis();
    };
    
    // 语音输入（模拟功能）
    if (voiceInputBtn) {
        voiceInputBtn.onclick = function() {
            alert('语音输入功能开发中...');
        };
    }
}

// 检查是否可以开始诊断
function checkCanStartDiagnosis() {
    const uploadedImages = document.getElementById('uploadedImages');
    const startDiagnosisCard = document.getElementById('startDiagnosisCard');
    
    if (!uploadedImages || !startDiagnosisCard) return;
    
    const hasImages = uploadedImages.children.length > 0;
    
    if (hasImages) {
        startDiagnosisCard.style.display = 'block';
        startDiagnosisCard.scrollIntoView({ behavior: 'smooth' });
    } else {
        startDiagnosisCard.style.display = 'none';
    }
}

// 验证并开始诊断
function validateAndStartDiagnosis() {
    const uploadedImages = document.getElementById('uploadedImages');
    const textarea = document.getElementById('questionTextarea');
    
    // 验证是否有图片
    if (!uploadedImages || uploadedImages.children.length === 0) {
        showNotification('请先上传作物图片', 'error');
        return;
    }
    
    // 获取用户输入的问题描述
    const questionText = textarea ? textarea.value.trim() : '';
    
    // 隐藏输入区域，显示诊断状态
    const imageUploadCard = document.getElementById('imageUploadCard');
    const questionInputCard = document.getElementById('questionInputCard');
    const startDiagnosisCard = document.getElementById('startDiagnosisCard');
    const diagnosisStatusCard = document.getElementById('diagnosisStatusCard');
    const timelineCard = document.getElementById('timelineCard');
    
    if (imageUploadCard) imageUploadCard.style.display = 'none';
    if (questionInputCard) questionInputCard.style.display = 'none';
    if (startDiagnosisCard) startDiagnosisCard.style.display = 'none';
    if (diagnosisStatusCard) diagnosisStatusCard.style.display = 'block';
    if (timelineCard) timelineCard.style.display = 'block';
    
    // 开始AI诊断
    startAIDiagnosis();
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => notification.classList.add('show'), 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function startAIDiagnosis() {
    // 模拟AI诊断进度
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            completeAIDiagnosis();
        }
        
        // 更新进度条
        const progressBar = document.getElementById('diagnosisProgress');
        const progressText = document.getElementById('progressText');
        if (progressBar && progressText) {
            progressBar.style.width = progress + '%';
            progressText.textContent = `分析中 ${Math.round(progress)}%`;
        }
        
        // 更新时间线
        updateTimeline(progress);
    }, 200);
}

function updateTimeline(progress) {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const step4 = document.getElementById('step-4');
    
    // 重置所有步骤
    [step1, step2, step3, step4].forEach(step => {
        if (step) {
            step.classList.remove('active', 'completed');
            const stepBox = step.querySelector('.step-box');
            const stepIcon = step.querySelector('.step-icon');
            const stepCheck = step.querySelector('.step-check');
            if (stepBox && stepIcon && stepCheck) {
                stepIcon.style.display = 'block';
                stepCheck.style.display = 'none';
            }
        }
    });
    
    if (progress >= 25 && step1) {
        step1.classList.add('completed');
        const stepBox = step1.querySelector('.step-box');
        const stepIcon = step1.querySelector('.step-icon');
        const stepCheck = step1.querySelector('.step-check');
        if (stepBox && stepIcon && stepCheck) {
            stepIcon.style.display = 'none';
            stepCheck.style.display = 'block';
        }
    }
    
    if (progress >= 50 && step2) {
        step2.classList.add('completed');
        const stepBox = step2.querySelector('.step-box');
        const stepIcon = step2.querySelector('.step-icon');
        const stepCheck = step2.querySelector('.step-check');
        if (stepBox && stepIcon && stepCheck) {
            stepIcon.style.display = 'none';
            stepCheck.style.display = 'block';
        }
    }
    
    if (progress >= 75 && step3) {
        step3.classList.add('completed');
        const stepBox = step3.querySelector('.step-box');
        const stepIcon = step3.querySelector('.step-icon');
        const stepCheck = step3.querySelector('.step-check');
        if (stepBox && stepIcon && stepCheck) {
            stepIcon.style.display = 'none';
            stepCheck.style.display = 'block';
        }
    }
    
    if (progress >= 100 && step4) {
        step4.classList.add('completed');
        const stepBox = step4.querySelector('.step-box');
        const stepIcon = step4.querySelector('.step-icon');
        const stepCheck = step4.querySelector('.step-check');
        if (stepBox && stepIcon && stepCheck) {
            stepIcon.style.display = 'none';
            stepCheck.style.display = 'block';
        }
    }
}

function completeAIDiagnosis() {
    // 显示诊断结果
    const diagnosisResult = document.getElementById('diagnosisResult');
    const expertSection = document.getElementById('expertSection');
    const productRecommendation = document.getElementById('productRecommendation');
    const diagnosisStatusCard = document.getElementById('diagnosisStatusCard');
    
    // 诊断完成后隐藏进度卡片，避免残留显示不全
    if (diagnosisStatusCard) {
        diagnosisStatusCard.style.display = 'none';
    }
    
    if (diagnosisResult) {
        diagnosisResult.style.display = 'block';
        diagnosisResult.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 延迟显示专家推荐与连线
    setTimeout(() => {
        if (expertSection) {
            expertSection.style.display = 'block';
            expertSection.scrollIntoView({ behavior: 'smooth' });
            // 初始化专家卡片滑动功能
            initExpertCarousel();
        }
    }, 1000);
    
    // 延迟显示商品推荐
    setTimeout(() => {
        if (productRecommendation) {
            productRecommendation.style.display = 'block';
            productRecommendation.scrollIntoView({ behavior: 'smooth' });
        }
    }, 2000);
}

function showExpertRecommendation() {
    const expertCard = document.getElementById('expertSection');
    if (expertCard) {
        expertCard.style.display = 'block';
        expertCard.scrollIntoView({ behavior: 'smooth' });
        // 初始化专家卡片滑动功能
        initExpertCarousel();
    }
}

// 初始化专家卡片滑动功能
function initExpertCarousel() {
    const container = document.getElementById('expertsContainer');
    const indicators = document.querySelectorAll('.indicator');
    const cards = document.querySelectorAll('.expert-card');
    
    if (!container || !indicators.length || !cards.length) return;
    
    let currentIndex = 0;
    
    // 点击指示器切换卡片
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });
    
    // 更新轮播状态
    function updateCarousel() {
        // 移动容器
        container.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // 更新指示器
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
        
        // 更新卡片状态
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentIndex);
        });
    }
    
    // 自动轮播
    setInterval(() => {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    }, 5000);
}

function showOrderManagement() {
    // 显示订单管理页面
    alert('跳转到闭环跟进页面');
}

// 专家数据
const expertData = {
    wangjianguo: {
        name: '王建国',
        specialties: ['玉米病害', '小麦锈病'],
        background: '从事农业植保工作15年，专注于玉米和小麦病害研究，发表相关论文20余篇，具有丰富的田间实践经验。',
        knowledge: [
            { title: '玉米病害诊断手册', desc: '包含50+种玉米常见病害的识别与防治方法', price: '¥29.9' },
            { title: '小麦锈病防治方案', desc: '专业的小麦锈病预防与治疗指导', price: '¥19.9' }
        ],
        products: [
            { name: '杀菌剂A', desc: '广谱杀菌剂，对叶斑病效果显著', tags: ['专家推荐', 'AI匹配'], price: '¥28.00' },
            { name: '防治套餐', desc: '综合防治方案，包含多种药剂', tags: ['专家推荐'], price: '¥128.00' }
        ]
    },
    limin: {
        name: '李敏',
        specialties: ['水稻虫害', '植保方案'],
        background: '水稻病虫害防治专家，拥有12年水稻种植和病虫害防治经验，擅长制定综合植保方案。',
        knowledge: [
            { title: '水稻虫害识别指南', desc: '详细的水稻常见虫害识别与防治方法', price: '¥24.9' },
            { title: '植保方案制定手册', desc: '科学制定植保方案的专业指导', price: '¥34.9' }
        ],
        products: [
            { name: '虫害套装', desc: '针对水稻虫害的综合防治套装', tags: ['专家推荐'], price: '¥88.00' }
        ]
    },
    zhangsan: {
        name: '张三',
        specialties: ['果树病害', '土壤改良'],
        background: '果树栽培与土壤改良专家，专注于果树病害防治和土壤健康管理，拥有18年实践经验。',
        knowledge: [
            { title: '果树病害防治大全', desc: '涵盖各类果树常见病害的防治方法', price: '¥39.9' },
            { title: '土壤改良技术指南', desc: '科学改良土壤的专业技术指导', price: '¥29.9' }
        ],
        products: [
            { name: '有机肥料', desc: '高品质有机肥料，改善土壤结构', tags: ['专家推荐'], price: '¥45.00' },
            { name: '土壤调理剂', desc: '专业土壤调理剂，平衡土壤酸碱度', tags: ['专家推荐'], price: '¥35.00' }
        ]
    },
    lisi: {
        name: '李四',
        specialties: ['蔬菜种植', '温室管理'],
        background: '蔬菜种植与温室管理专家，精通各类蔬菜的种植技术和温室环境控制，拥有14年实践经验。',
        knowledge: [
            { title: '蔬菜种植技术手册', desc: '各类蔬菜的科学种植技术指导', price: '¥32.9' },
            { title: '温室管理实用指南', desc: '温室环境控制与管理的最佳实践', price: '¥27.9' }
        ],
        products: [
            { name: '温室设备', desc: '专业温室设备，提升种植效率', tags: ['专家推荐'], price: '¥299.00' },
            { name: '种植技术', desc: '科学种植技术指导服务', tags: ['专家推荐'], price: '¥199.00' }
        ]
    },
    wangwu: {
        name: '王五',
        specialties: ['植保技术', '农药使用'],
        background: '植保技术与农药使用专家，专注于安全用药和植保技术推广，拥有16年植保工作经验。',
        knowledge: [
            { title: '安全用药指南', desc: '农药安全使用的专业指导', price: '¥22.9' },
            { title: '植保技术大全', desc: '现代植保技术的综合应用指南', price: '¥36.9' }
        ],
        products: [
            { name: '安全用药', desc: '安全用药指导服务', tags: ['专家推荐'], price: '¥158.00' },
            { name: '植保方案', desc: '定制化植保方案制定', tags: ['专家推荐'], price: '¥268.00' }
        ]
    }
};

// 加载页面
function loadPage(pageName, param) {
    const phoneContent = document.getElementById('phoneContent');
    const pageInfo = pageData[pageName];
    
    if (pageInfo) {
        if (!window.__pageStack) window.__pageStack = [];
        if (window.currentPage) {
            window.__pageStack.push(window.currentPage);
        }
        // 更新页面内容
        phoneContent.innerHTML = pageInfo.content;
        
        // 更新当前页面
        currentPage = pageName;
        
        // 更新导航状态
        updateNavigationState(pageName);

        // 确保底部导航存在并高亮当前页
        ensureTabbar(pageName);
        
        // 滚动到顶部
        phoneContent.scrollTop = 0;
        
        // 如果是首页，初始化AI诊断功能和气象预警banner
        if (pageName === 'home') {
            setTimeout(() => {
                console.log('Initializing inline AI diagnosis features...');
                setupInlineAIDiagnosis();
                initWeatherAlertBanner();
            }, 100);
        }
        
        // 如果是报告页面，初始化报告内容
        if (pageName === 'weatherReport') {
            setTimeout(() => {
                renderWeatherReport();
            }, 100);
        }
        
        // 如果是智能体广场页面，自动绑定卡片点击事件
        if (pageName === 'agentMarket') {
            setTimeout(() => {
                initAgentCardClicks();
            }, 100);
        }
        
        // 如果是专家详情页面，加载专家数据
        if (pageName === 'expertDetail' && param && expertData[param]) {
            setTimeout(() => {
                loadExpertDetail(param);
            }, 100);
        }
        
        // 如果是AI诊断页面，显示用户输入并直接开始诊断
        if (pageName === 'aiDiagnosis') {
            setTimeout(() => {
                console.log('Auto-starting AI diagnosis...');
                if (window.currentDiagnosisData) {
                    displayUserInputSummary(window.currentDiagnosisData);
                    startAIDiagnosis();
                } else {
                    console.log('No legacy data; bind conversation if any.');
                    // 渲染历史会话（若从历史进入）
                    const inputCard = document.getElementById('questionInputCard');
                    // 若没有当前会话，显示AI诊断输入卡片
                    if (!conversationStore.currentId && inputCard) {
                        inputCard.style.display = 'block';
                    }
                    if (conversationStore.currentId) {
                        const c = getConversation(conversationStore.currentId);
                        if (c) {
                            // 隐藏输入卡片，显示已提交内容
                            if (inputCard) inputCard.style.display = 'none';
                            displayUserInputSummary({ questionText: c.inputText, images: [] });
                            if (c.status === 'queued' || c.status === 'running') {
                                startAIDiagnosis();
                            }
                        }
                    }
                }
            }, 100);
        }
        
        // 如果是价格智能体页面，初始化主页
        if (pageName === 'wheatPriceAgent' || pageName === 'cornPriceAgent' || pageName === 'soyPriceAgent') {
            setTimeout(() => {
                console.log('Initializing price agent home...');
                initPriceAgentHome(pageName);
            }, 100);
        }
        
        // 如果是首页，初始化价格趋势图
        if (pageName === 'home') {
            setTimeout(() => {
                initPriceSparkline();
            }, 200);
        }
    }
}

// 确保底部导航存在并设置选中态
function ensureTabbar(pageName) {
    try {
        const pageEl = document.querySelector('.mobile-page');
        if (!pageEl) return;

        // AI相关页面(新三段式：智能体广场/AI对话/我的订阅 以及 旧AI页)不插入全局5项tabbar
        const isAIFourMenuPage = ['agentMarket','aiChatCenter','mySubscriptions','aiNewChat','expertRecommend','historyDialog','aiDiagnosis','pestDetect'].includes(pageName);
        // 若页面内不存在通用 tabbar，则插入（非AI四菜单页）
        if (!isAIFourMenuPage && !pageEl.querySelector('.mobile-footer.tabbar')) {
            // 确保weather-report-page使用flex布局
            if (pageName === 'weatherReport') {
                pageEl.classList.add('weather-report-page');
            }
            const footerHtml = `
                <div class="mobile-footer tabbar">
                    <div class="tab-item" data-page="home"><i class="fas fa-home"></i><span>首页</span></div>
                    <div class="tab-item" data-page="mall"><i class="fas fa-store"></i><span>商城</span></div>
                    <div class="tab-item" data-page="ai"><i class="fas fa-robot"></i><span>AI</span></div>
                    <div class="tab-item" data-page="workbench"><i class="fas fa-briefcase"></i><span>工作台</span></div>
                    <div class="tab-item" data-page="profile"><i class="fas fa-user"></i><span>我的</span></div>
                </div>
            `;
            pageEl.insertAdjacentHTML('beforeend', footerHtml);
        }

        // 将业务页面名映射为 tabbar 的 data-page 值
        const tabKey = (function(name) {
            if (name === 'fieldWorkstation') return 'workbench';
            if (name === 'workbench') return 'workbench';
            // 新AI三段式页面在全局tabbar上归为 AI
            if (['agentMarket','aiChatCenter','mySubscriptions','aiNewChat','expertRecommend','historyDialog','aiDiagnosis','wheatPriceAgent','cornPriceAgent','soyPriceAgent'].includes(name)) return 'ai';
            return name;
        })(pageName);

        // 重置并设置选中态
        document.querySelectorAll('.mobile-footer.tabbar .tab-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-page') === tabKey);
        });
    } catch (e) {
        console.error('ensureTabbar error:', e);
    }
}

// 返回上一页
function goBack() {
    if (window.__pageStack && window.__pageStack.length > 0) {
        const prev = window.__pageStack.pop();
        if (prev) loadPage(prev);
    } else {
        loadPage('home');
    }
}

// 更新导航状态
function updateNavigationState(pageName) {
    // 清除所有活动状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 设置当前页面的活动状态
    const activeItem = document.querySelector(`[data-page="${pageName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        
        // 如果是子菜单项，展开父菜单
        if (activeItem.classList.contains('sub-item')) {
            const parentSection = activeItem.closest('.nav-section');
            const mainItem = parentSection.querySelector('.main-item');
            const subMenu = parentSection.querySelector('.sub-menu');
            
            if (mainItem && subMenu) {
                mainItem.classList.add('expanded');
                subMenu.classList.add('expanded');
            }
        }
    }
}

// 显示消息页面
function showMessages() {
    showNotification('消息功能开发中...', 'info');
}

// 显示即将推出功能
function showComingSoon(featureName) {
    if (featureName === '与现有功能保持一致') {
        showNotification('与现有功能保持一致', 'info');
    } else {
        showNotification(`${featureName}功能即将推出，敬请期待！`, 'info');
    }
}

// ===== 智能体卡片点击处理 =====
function initAgentCardClicks() {
    // 为所有智能体卡片绑定点击事件
    const cards = document.querySelectorAll('.agent-card-detailed');
    cards.forEach(card => {
        const agentId = card.getAttribute('data-agent-id');
        const priceType = card.getAttribute('data-price');
        
        if (agentId && priceType) {
            card.onclick = function(event) {
                handleAgentCardClick(event, agentId, priceType);
            };
        }
    });
}

function handleAgentCardClick(event, agentId, priceType) {
    // 如果点击的是订阅按钮，阻止卡片点击事件
    if (event.target.closest('.subscribe-btn')) {
        event.stopPropagation();
        return;
    }
    
    // 特殊处理：气象灾害预警智能体跳转到专属主页
    if (agentId === 'weather-disaster') {
        loadWeatherDisasterHome();
        return;
    }
    
    const card = document.querySelector(`[data-agent-id="${agentId}"]`);
    const agentName = card.querySelector('.agent-name').textContent;
    
    if (priceType === 'free') {
        // 免费智能体，直接跳转到AI对话页面
        loadAgentChatPage(agentId, agentName);
    } else {
        // 付费智能体，检查是否已订阅
        const subscribeBtn = card.querySelector('.subscribe-btn');
        if (subscribeBtn && subscribeBtn.classList.contains('subscribed')) {
            // 已订阅，跳转到AI对话页面
            loadAgentChatPage(agentId, agentName);
        } else {
            // 未订阅，提示需要付费订阅
            const agentPrice = card.querySelector('.agent-price').textContent;
            showPaymentRequired(agentId, agentName, agentPrice);
        }
    }
}

function showPaymentRequired(agentId, agentName, agentPrice) {
    // 显示付费提示对话框
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'payment-modal';
    confirmDialog.innerHTML = `
        <div class="modal-overlay" onclick="closePaymentModal()"></div>
        <div class="modal-content payment-modal-content">
            <div class="modal-header">
                <h3>需要订阅</h3>
                <button class="close-btn" onclick="closePaymentModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="payment-info">
                    <div class="agent-info-preview">
                        <div class="agent-name-large">${agentName}</div>
                        <div class="subscription-type">需要月度会员</div>
                    </div>
                    <div class="price-info">
                        <div class="price-label">订阅后即可使用</div>
                        <div class="price-amount">${agentPrice}</div>
                        <div class="price-note">按月自动续费，可随时取消</div>
                    </div>
                    <div class="payment-benefits">
                        <div class="benefit-title">会员权益：</div>
                        <div class="benefit-item"><i class="fas fa-check-circle"></i> 无限次使用智能体服务</div>
                        <div class="benefit-item"><i class="fas fa-check-circle"></i> 优先获得功能更新</div>
                        <div class="benefit-item"><i class="fas fa-check-circle"></i> 专属客服支持</div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closePaymentModal()">取消</button>
                <button class="btn-primary" onclick="confirmPayment('${agentId}', '${agentName}', '${agentPrice}')">
                    <i class="fas fa-lock"></i> 立即订阅
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmDialog);
}

function loadAgentChatPage(agentId, agentName) {
    // 创建AI对话页面
    if (!pageData.agentChat) {
        pageData.agentChat = {
            title: 'AI对话',
            subtitle: '智能体对话',
            content: ''
        };
    }
    
    // 生成对话页面内容
    pageData.agentChat.title = agentName;
    pageData.agentChat.content = `
        <div class="mobile-page agent-chat-page">
            <div class="mobile-header chat-header">
                <button class="back-btn" onclick="goBack()">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <div class="chat-title">
                    <h1>${agentName}</h1>
                    <div class="chat-subtitle">AI智能助手</div>
                </div>
                <button class="header-menu-btn" onclick="showChatMenu()">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
            <div class="chat-messages-container" id="chatMessagesContainer">
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-welcome">
                        <div class="welcome-icon">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="welcome-text">您好！我是${agentName}，有什么可以帮您的吗？</div>
                        <div class="quick-questions">
                            <div class="quick-question" onclick="sendQuickQuestion('如何使用这个智能体？')">
                                如何使用这个智能体？
                            </div>
                            <div class="quick-question" onclick="sendQuickQuestion('你能帮我做什么？')">
                                你能帮我做什么？
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="chat-input-area">
                <div class="chat-input-container">
                    <button class="voice-btn" onclick="startVoiceInput()">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <input type="text" 
                           class="chat-input" 
                           id="chatInput" 
                           placeholder="有什么需要问我的吗~" 
                           onkeypress="if(event.key==='Enter') sendChatMessage()">
                    <button class="add-btn" onclick="showAddMenu()">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="send-btn" onclick="sendChatMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    loadPage('agentChat');
    
    // 存储当前智能体信息
    window.currentAgentId = agentId;
    window.currentAgentName = agentName;
}

// ===== AI对话相关功能 =====
function sendQuickQuestion(question) {
    document.getElementById('chatInput').value = question;
    sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) {
        return;
    }
    
    // 添加用户消息
    addChatMessage('user', message);
    input.value = '';
    
    // 模拟AI回复
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        addChatMessage('ai', aiResponse);
    }, 800);
}

function addChatMessage(type, content) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    if (type === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content user-content">
                <div class="message-bubble">${content}</div>
            </div>
            <div class="message-avatar user-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content ai-content">
                <div class="message-bubble">${content}</div>
                <div class="message-actions">
                    <button class="action-btn" onclick="copyMessage(this)" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn" onclick="likeMessage(this)" title="赞">
                        <i class="far fa-thumbs-up"></i>
                    </button>
                    <button class="action-btn" onclick="dislikeMessage(this)" title="踩">
                        <i class="far fa-thumbs-down"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // 滚动到底部
    const container = document.getElementById('chatMessagesContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

function generateAIResponse(userMessage) {
    // 简单的AI回复生成逻辑
    const responses = [
        `关于"${userMessage}"这个问题，我可以为您提供专业的建议。`,
        `我理解您的需求，让我为您分析一下。`,
        `这是一个很好的问题！根据我的知识库，`,
        `针对您提到的情况，我建议您可以考虑以下几点：`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           `\n\n具体来说，${window.currentAgentName || '我'}可以帮助您分析和解决这个问题。如果您需要更详细的解答，请继续提问。`;
}

function copyMessage(btn) {
    const bubble = btn.closest('.message-content').querySelector('.message-bubble');
    navigator.clipboard.writeText(bubble.textContent);
    showNotification('已复制到剪贴板', 'success');
}

function likeMessage(btn) {
    btn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
    btn.style.color = '#21c08b';
    showNotification('感谢您的反馈', 'success');
}

function dislikeMessage(btn) {
    btn.innerHTML = '<i class="fas fa-thumbs-down"></i>';
    btn.style.color = '#ff6b6b';
    showNotification('我们会继续改进', 'info');
}

function showChatMenu() {
    showNotification('聊天菜单功能开发中...', 'info');
}

function showAddMenu() {
    showNotification('附件功能开发中...', 'info');
}

// ===== 智能体订阅功能 =====
function subscribeAgent(agentId, priceType) {
    const card = document.querySelector(`[data-agent-id="${agentId}"]`);
    const subscribeBtn = card.querySelector('.subscribe-btn');
    const agentName = card.querySelector('.agent-name').textContent;
    
    // 检查是否已经订阅
    if (subscribeBtn.classList.contains('subscribed')) {
        showNotification('您已订阅该智能体', 'info');
        return;
    }
    
    if (priceType === 'free') {
        // 免费智能体直接订阅
        subscribeBtn.textContent = '已订阅';
        subscribeBtn.classList.add('subscribed');
        showNotification(`订阅成功！您已成功订阅 ${agentName}`, 'success');
        
        // 更新我的订阅页面（这里可以添加实际的数据持久化逻辑）
        updateMySubscriptions(agentId, agentName, priceType);
    } else {
        // 付费智能体，显示月度会员付费提示
        const agentPrice = card.querySelector('.agent-price').textContent;
        
        // 创建付费确认对话框
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'payment-modal';
        confirmDialog.innerHTML = `
            <div class="modal-overlay" onclick="closePaymentModal()"></div>
            <div class="modal-content payment-modal-content">
                <div class="modal-header">
                    <h3>订阅确认</h3>
                    <button class="close-btn" onclick="closePaymentModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="payment-info">
                        <div class="agent-info-preview">
                            <div class="agent-name-large">${agentName}</div>
                            <div class="subscription-type">月度会员</div>
                        </div>
                        <div class="price-info">
                            <div class="price-label">订阅费用</div>
                            <div class="price-amount">${agentPrice}</div>
                            <div class="price-note">按月自动续费，可随时取消</div>
                        </div>
                        <div class="payment-benefits">
                            <div class="benefit-title">会员权益：</div>
                            <div class="benefit-item"><i class="fas fa-check-circle"></i> 无限次使用智能体服务</div>
                            <div class="benefit-item"><i class="fas fa-check-circle"></i> 优先获得功能更新</div>
                            <div class="benefit-item"><i class="fas fa-check-circle"></i> 专属客服支持</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closePaymentModal()">取消</button>
                    <button class="btn-primary" onclick="confirmPayment('${agentId}', '${agentName}', '${agentPrice}')">
                        <i class="fas fa-lock"></i> 确认付费订阅
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmDialog);
    }
}

function closePaymentModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        modal.remove();
    }
}

function confirmPayment(agentId, agentName, agentPrice) {
    // 模拟支付流程
    showNotification('正在处理支付...', 'info');
    
    setTimeout(() => {
        const card = document.querySelector(`[data-agent-id="${agentId}"]`);
        const subscribeBtn = card.querySelector('.subscribe-btn');
        
        subscribeBtn.textContent = '已订阅';
        subscribeBtn.classList.add('subscribed');
        
        closePaymentModal();
        showNotification(`订阅成功！您已成功订阅 ${agentName} 月度会员`, 'success');
        
        // 更新我的订阅页面
        updateMySubscriptions(agentId, agentName, 'paid', agentPrice);
    }, 1500);
}

function updateMySubscriptions(agentId, agentName, priceType, agentPrice = '免费') {
    // 这里可以添加实际的数据持久化逻辑
    // 例如：将订阅信息保存到 localStorage 或发送到后端服务器
    
    // 简单的localStorage实现
    let subscriptions = JSON.parse(localStorage.getItem('agentSubscriptions') || '[]');
    
    // 检查是否已存在
    if (!subscriptions.find(sub => sub.id === agentId)) {
        subscriptions.push({
            id: agentId,
            name: agentName,
            type: priceType,
            price: agentPrice,
            subscribeDate: new Date().toISOString()
        });
        
        localStorage.setItem('agentSubscriptions', JSON.stringify(subscriptions));
    }
}

// ===== AI中心（新三段式）交互函数 =====
function showExamplesModal() {
    const modal = document.getElementById('examplesModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function hideExamplesModal() {
    const modal = document.getElementById('examplesModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function selectExample(question) {
    const inputEl = document.getElementById('aiCenterInput');
    if (inputEl) {
        inputEl.value = question;
        hideExamplesModal();
    }
}

function previewAICenterImages(inputEl) {
    const preview = document.getElementById('aiCenterImagePreview');
    if (!preview) return;
    preview.innerHTML = '';
    const files = Array.from(inputEl.files || []);
    files.slice(0, 3).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '48px';
            img.style.height = '48px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            img.style.marginRight = '6px';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function startAICenterChat() {
    const text = (document.getElementById('aiCenterInput') || {}).value || '';
    const conv = createConversation({ title: 'AI对话', inputText: text, images: [] });
    console.log('Start AI center chat:', conv);
    // 进入旧的诊断详情页复用富媒体与进度演示
    loadPage('aiDiagnosis');
}

function openAgentDetail(agentId) {
    // 原型：弹提示并自动将示例加入"我的订阅"以便演示
    showNotification(`打开智能体详情：${agentId}（原型）`, 'success');
    // 标记示例订阅已购
    setTimeout(() => {
        const empty = document.getElementById('subsEmpty');
        const item = document.getElementById('subsExample');
        if (empty && item) {
            empty.style.display = 'none';
            item.style.display = 'block';
        }
    }, 300);
}

// 切换订阅演示状态
function toggleSubscriptionDemo() {
    const empty = document.getElementById('subsEmpty');
    const content = document.getElementById('subsContent');
    const toggleBtn = document.querySelector('.demo-toggle-btn i');
    
    if (empty && content) {
        if (empty.style.display === 'none') {
            // 切换到未订阅状态
            empty.style.display = 'block';
            content.style.display = 'none';
            toggleBtn.className = 'fas fa-toggle-off';
            showNotification('已切换到未订阅状态', 'info');
        } else {
            // 切换到已订阅状态
            empty.style.display = 'none';
            content.style.display = 'block';
            toggleBtn.className = 'fas fa-toggle-on';
            showNotification('已切换到已订阅状态', 'success');
        }
    }
}

// 显示续费弹窗
function showRenewalModal(agentId) {
    const modal = document.getElementById('renewalModal');
    const agentData = getAgentData(agentId);
    
    if (modal && agentData) {
        // 更新弹窗内容
        document.getElementById('renewalAgentIcon').innerHTML = `<i class="${agentData.icon}"></i>`;
        document.getElementById('renewalAgentName').textContent = agentData.name;
        document.getElementById('renewalAgentDesc').textContent = agentData.desc;
        document.getElementById('renewalCurrentStatus').textContent = agentData.status;
        
        modal.style.display = 'flex';
    }
}

// 隐藏续费弹窗
function hideRenewalModal() {
    const modal = document.getElementById('renewalModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 确认续费
function confirmRenewal() {
    const selectedOption = document.querySelector('input[name="renewalOption"]:checked');
    if (selectedOption) {
        const count = selectedOption.value;
        const price = selectedOption.closest('.option-item').dataset.price;
        
        showNotification(`续费成功！已购买${count}次使用机会，花费¥${price}`, 'success');
        hideRenewalModal();
        
        // 这里可以更新页面上的剩余次数显示
        updateRemainingCount(count);
    }
}

// 获取智能体数据
function getAgentData(agentId) {
    const agentData = {
        'pesticide-advisor': {
            icon: 'fas fa-pills',
            name: '用药建议',
            desc: '精准用药指导',
            status: '剩余15次'
        },
        'yield-forecast': {
            icon: 'fas fa-chart-line',
            name: '产量预测',
            desc: 'AI预测作物产量',
            status: '剩余8次'
        }
    };
    
    return agentData[agentId] || {
        icon: 'fas fa-robot',
        name: '智能体',
        desc: '智能体描述',
        status: '剩余0次'
    };
}

// 更新剩余次数（演示用）
function updateRemainingCount(addedCount) {
    // 这里可以更新页面上的剩余次数显示
    showNotification(`剩余次数已更新（演示）`, 'info');
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'info' ? 'info-circle' : type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 全局页面加载函数（供HTML中的onclick调用）
window.loadPage = loadPage;
window.showMessages = showMessages;
window.showComingSoon = showComingSoon; 
window.goBack = function() {
    const phoneContent = document.getElementById('phoneContent');
    if (!window.__pageStack || window.__pageStack.length === 0) {
        // 栈为空，退回到首页
        currentPage = 'home';
        phoneContent.innerHTML = pageData.home.content;
        updateNavigationState('home');
        return;
    }
    const prev = window.__pageStack.pop();
    currentPage = prev;
    phoneContent.innerHTML = pageData[prev].content;
    updateNavigationState(prev);
};

// AI设定相关变量
let currentAIType = '';
let aiAnalysisTimeout = null;

// 显示AI设定弹窗
window.showAIDialog = function(type) {
    currentAIType = type;
    const dialog = document.getElementById('aiDialog');
    if (dialog) {
        dialog.classList.add('show');
        // 模拟AI分析过程
        startAIAnalysis();
    }
};

// 隐藏AI设定弹窗
window.hideAIDialog = function() {
    const dialog = document.getElementById('aiDialog');
    if (dialog) {
        dialog.classList.remove('show');
    }
    if (aiAnalysisTimeout) {
        clearTimeout(aiAnalysisTimeout);
    }
};

// 开始AI分析
function startAIAnalysis() {
    const analysisDiv = document.getElementById('aiAnalysis');
    if (!analysisDiv) return;
    
    // 显示加载状态
    analysisDiv.innerHTML = `
        <div class="ai-loading">
            <i class="fas fa-spinner fa-spin"></i>
            正在分析...
        </div>
    `;
    
    // 模拟AI分析延迟
    aiAnalysisTimeout = setTimeout(() => {
        const cropType = document.getElementById('cropType').value;
        const location = document.getElementById('location').value;
        const plantingPlan = document.getElementById('plantingPlan').value;
        
        // 根据AI类型生成不同的分析结果
        if (currentAIType === 'soil') {
            showSoilAnalysis(cropType, location, plantingPlan);
        } else if (currentAIType === 'crop') {
            showCropAnalysis(cropType, location, plantingPlan);
        }
    }, 2000);
}

// 显示土壤分析结果
function showSoilAnalysis(cropType, location, plantingPlan) {
    const analysisDiv = document.getElementById('aiAnalysis');
    const analysisData = getSoilAnalysisData(cropType, location, plantingPlan);
    
    analysisDiv.innerHTML = `
        <div class="ai-result">
            <div class="ai-result-item ai-suggestion">
                <strong>AI建议:</strong> ${analysisData.suggestion}
            </div>
            <div class="ai-result-item">
                <strong>检测时间:</strong> 施肥后第${analysisData.detectionDay}天
            </div>
            <div class="ai-result-item">
                <strong>检测点位:</strong> ${analysisData.points}个
            </div>
            <div class="ai-result-item">
                <strong>有效区域:</strong> ${analysisData.area}米
            </div>
            <div class="ai-result-item">
                <strong>关键指标:</strong> ${analysisData.indicators.join(', ')}
            </div>
        </div>
    `;
}

// 显示作物分析结果
function showCropAnalysis(cropType, location, plantingPlan) {
    const analysisDiv = document.getElementById('aiAnalysis');
    const analysisData = getCropAnalysisData(cropType, location, plantingPlan);
    
    analysisDiv.innerHTML = `
        <div class="ai-result">
            <div class="ai-result-item ai-suggestion">
                <strong>AI建议:</strong> ${analysisData.suggestion}
            </div>
            <div class="ai-result-item">
                <strong>拍照时间:</strong> 农事活动后第${analysisData.photoDay}天
            </div>
            <div class="ai-result-item">
                <strong>拍照点位:</strong> ${analysisData.points}个
            </div>
            <div class="ai-result-item">
                <strong>有效区域:</strong> ${analysisData.area}米
            </div>
            <div class="ai-result-item">
                <strong>拍照数量:</strong> ${analysisData.photoCount}张/点位
            </div>
        </div>
    `;
}

// 获取土壤分析数据
function getSoilAnalysisData(cropType, location, plantingPlan) {
    // 根据作物类型名称获取对应的英文key
    const cropTypeMap = {
        '小麦': 'wheat',
        '玉米': 'corn',
        '水稻': 'rice',
        '大豆': 'soybean'
    };
    
    const cropKey = cropTypeMap[cropType] || 'wheat';
    
    const data = {
        wheat: {
            detectionDay: 7,
            points: 5,
            area: 50,
            indicators: ['氮', '磷', '钾', 'pH值'],
            suggestion: '小麦生长期需要重点关注氮肥含量，建议增加氮元素检测频率'
        },
        corn: {
            detectionDay: 5,
            points: 6,
            area: 60,
            indicators: ['氮', '磷', '钾', '有机质'],
            suggestion: '玉米对磷肥需求较高，建议重点监测磷元素变化'
        },
        rice: {
            detectionDay: 3,
            points: 4,
            area: 40,
            indicators: ['氮', '钾', 'pH值', '盐分'],
            suggestion: '水稻种植需要控制土壤pH值，建议定期监测酸碱度'
        },
        soybean: {
            detectionDay: 6,
            points: 5,
            area: 45,
            indicators: ['氮', '磷', '钾', '微量元素'],
            suggestion: '大豆固氮能力强，可适当减少氮肥检测频率'
        }
    };
    
    return data[cropKey];
}

// 获取作物分析数据
function getCropAnalysisData(cropType, location, plantingPlan) {
    // 根据作物类型名称获取对应的英文key
    const cropTypeMap = {
        '小麦': 'wheat',
        '玉米': 'corn',
        '水稻': 'rice',
        '大豆': 'soybean'
    };
    
    const cropKey = cropTypeMap[cropType] || 'wheat';
    
    const data = {
        wheat: {
            photoDay: 3,
            points: 3,
            area: 30,
            photoCount: 2,
            suggestion: '小麦分蘖期是关键观察期，建议增加拍照频率'
        },
        corn: {
            photoDay: 5,
            points: 4,
            area: 40,
            photoCount: 3,
            suggestion: '玉米抽雄期需要重点观察，建议多角度拍照'
        },
        rice: {
            photoDay: 2,
            points: 3,
            area: 25,
            photoCount: 2,
            suggestion: '水稻分蘖期生长迅速，建议每日观察记录'
        },
        soybean: {
            photoDay: 4,
            points: 3,
            area: 35,
            photoCount: 2,
            suggestion: '大豆开花期是关键期，建议增加观察密度'
        }
    };
    
    return data[cropKey];
}

// 应用AI设定
window.applyAISettings = function() {
    const cropType = document.getElementById('cropType').value;
    const analysisData = currentAIType === 'soil' ? 
        getSoilAnalysisData(cropType) : 
        getCropAnalysisData(cropType);
    
    // 根据AI类型填充不同的表单
    if (currentAIType === 'soil') {
        // 填充土壤检测表单
        const inputs = document.querySelectorAll('.fieldWorkstation-page input[type="number"]');
        if (inputs.length >= 4) {
            inputs[0].value = analysisData.detectionDay; // 检测天数
            inputs[2].value = analysisData.points; // 点位数量
            inputs[3].value = analysisData.area; // 有效区域
        }
    } else if (currentAIType === 'crop') {
        // 填充作物拍照表单
        const inputs = document.querySelectorAll('.fieldWorkstation-page input[type="number"]');
        if (inputs.length >= 6) {
            inputs[4].value = analysisData.photoDay; // 拍照天数
            inputs[6].value = analysisData.points; // 点位数量
            inputs[7].value = analysisData.area; // 有效区域
            inputs[8].value = analysisData.photoCount; // 拍照数量
        }
    }
    
    // 隐藏弹窗
    hideAIDialog();
    
    // 显示成功提示
    showToast('AI设定已应用');
};

// 显示内嵌式提示卡片
function showInlineNotification(message, type = 'info', targetElement = null) {
    // 移除现有的提示卡片
    const existingNotification = document.querySelector('.inline-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建提示卡片
    const notification = document.createElement('div');
    notification.className = `inline-notification inline-notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // 插入到目标元素之前，如果没有目标元素则插入到页面顶部
    if (targetElement) {
        targetElement.parentNode.insertBefore(notification, targetElement);
    } else {
        const phoneContent = document.getElementById('phoneContent');
        if (phoneContent) {
            phoneContent.insertBefore(notification, phoneContent.firstChild);
        }
    }
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 自动隐藏（可选）
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// 显示状态栏提示
function showStatusBarNotification(message, type = 'info') {
    // 移除现有的状态栏提示
    const existingStatusBar = document.querySelector('.status-bar-notification');
    if (existingStatusBar) {
        existingStatusBar.remove();
    }
    
    // 创建状态栏提示
    const statusBar = document.createElement('div');
    statusBar.className = `status-bar-notification status-bar-${type}`;
    statusBar.innerHTML = `
        <div class="status-bar-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 插入到页面顶部
    const phoneContent = document.getElementById('phoneContent');
    if (phoneContent) {
        phoneContent.insertBefore(statusBar, phoneContent.firstChild);
    }
    
    // 显示动画
    setTimeout(() => {
        statusBar.classList.add('show');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        if (statusBar.parentNode) {
            statusBar.classList.remove('show');
            setTimeout(() => {
                if (statusBar.parentNode) {
                    statusBar.remove();
                }
            }, 300);
        }
    }, 4000);
}

// 保持原有的showToast函数以兼容现有代码
function showToast(message, type = 'info') {
    // 根据消息类型选择不同的展示方式
    if (type === 'success' || type === 'error') {
        showStatusBarNotification(message, type);
    } else {
        showInlineNotification(message, type);
    }
}



// 分享记录
window.shareRecord = function() {
    showToast('农事服务记录分享功能');
};

// 导出报告
window.exportRecord = function() {
    showToast('农事服务报告导出功能');
}; 

// AI语音识别相关变量
let recognition = null;
let isRecording = false;
let isPaused = false;
let recordingTimer = null;
let recordingStartTime = null;
let realtimeTextTimer = null;
let currentText = '';
let inactivityCheckTimer = null; // 30秒未输入检测
let lastRealtimeUpdateTs = 0;
// 根据页面类型动态生成mockTexts
function getMockTextsForCurrentPage() {
    const currentPageElement = document.getElementById('phoneContent');
    const isNewFarmPlan = currentPageElement && currentPageElement.innerHTML.includes('新建农事方案');
    const isFarmPlanStep2 = currentPageElement && currentPageElement.innerHTML.includes('农事方案计划');
    
    if (isNewFarmPlan && !isFarmPlanStep2) {
        // 新建农事方案第一步
        return [
            "我要创建一个水仙花种植方案",
            "我要创建一个水仙花种植方案，方案名称是8月管理1号方案",
            "我要创建一个水仙花种植方案，方案名称是8月管理1号方案，所在区域是大厅水培植物基地",
            "我要创建一个水仙花种植方案，方案名称是8月管理1号方案，所在区域是大厅水培植物基地，种植面积1亩",
            "我要创建一个水仙花种植方案，方案名称是8月管理1号方案，所在区域是大厅水培植物基地，种植面积1亩，预计亩均产量500公斤",
            "我要创建一个水仙花种植方案，方案名称是8月管理1号方案，所在区域是大厅水培植物基地，种植面积1亩，预计亩均产量500公斤，预计亩均成本2000元，预计亩均收入3000元，指导专家是张教授，所属单位是农业技术推广站"
        ];
    } else if (isFarmPlanStep2) {
        // 新建农事方案第二步
        return [
            "我要添加一个打药计划",
            "我要添加一个打药计划，时间是从8月18日到8月20日",
            "我要添加一个打药计划，时间是从8月18日到8月20日，农事类型是打药",
            "我要添加一个打药计划，时间是从8月18日到8月20日，农事类型是打药，活动名称是第一季度打药作业活动",
            "我要添加一个打药计划，时间是从8月18日到8月20日，农事类型是打药，活动名称是第一季度打药作业活动，作物是冬小麦",
            "我要添加一个打药计划，时间是从8月18日到8月20日，农事类型是打药，活动名称是第一季度打药作业活动，作物是冬小麦，建议注意天气条件进行打药作业"
        ];
    } else {
        // 添加农事活动页面
        return [
            "我要为大厅水培植物基地",
            "我要为大厅水培植物基地的水仙花",
            "我要为大厅水培植物基地的水仙花安排打药活动",
            "我要为大厅水培植物基地的水仙花安排打药活动，时间是明天上午9点",
            "我要为大厅水培植物基地的水仙花安排打药活动，时间是明天上午9点到11点",
            "我要为大厅水培植物基地的水仙花安排打药活动，时间是明天上午9点到11点，负责人是王成龙"
        ];
    }
}

let mockTexts = getMockTextsForCurrentPage();
let textIndex = 0;

// 初始化语音识别（模拟版本）
function initSpeechRecognition() {
    console.log('语音识别功能已初始化（模拟模式）');
}

// 开始语音输入
window.startVoiceInput = function() {
    console.log('开始语音输入 - 直接开始录音');
    // 重新获取当前页面的mockTexts
    mockTexts = getMockTextsForCurrentPage();
    textIndex = 0; // 重置文本索引
    
    const modal = document.getElementById('aiVoiceModal');
    if (modal) {
        modal.classList.add('show');
        initSpeechRecognition();
        
        // 显示智能提示
        showSmartHint();
        
        // 直接开始录音，跳过"点击开始录音"步骤
        setTimeout(() => {
            console.log('直接开始录音');
            startRecording();
        }, 100);
    }
};

// 显示智能提示
function showSmartHint() {
    // 移除toast提示，改为在模态框内显示
    console.log('智能提示功能已启用');
}

// 关闭语音弹窗
window.closeVoiceModal = function() {
    const modal = document.getElementById('aiVoiceModal');
    if (modal) {
        modal.classList.remove('show');
        if (isRecording) {
            isRecording = false;
            isPaused = false;
            stopRecordingTimer();
            stopRealtimeText();
            stopInactivityTimer();
        }
    }
};

// 开始录音（模拟版本）
window.startRecording = function() {
    console.log('开始录音（模拟模式）');
    isRecording = true;
    isPaused = false;
    textIndex = 0;
    currentText = '';
    recordingStartTime = Date.now();
    startRecordingTimer();
    startRealtimeText();
    startInactivityTimer();
    lastRealtimeUpdateTs = Date.now();
    console.log('显示录音状态');
    showRecordingState();
};

// 重新录音（模拟版本）
window.reRecord = function() {
    // 清理状态
    isRecording = false;
    isPaused = false;
    stopRecordingTimer();
    stopRealtimeText();
    stopInactivityTimer();
    // 直接重新开始录音
    setTimeout(() => {
        startRecording();
    }, 500);
};

// 确认使用结果
window.confirmResult = function() {
    const resultTextEditable = document.getElementById('resultTextEditable');
    const resultText = resultTextEditable ? resultTextEditable.value.trim() : '';
    
    if (resultText) {
        console.log('用户确认使用编辑后的文本:', resultText);
        
        // 检查是否有编辑
        const originalText = formContext.lastInput ? Object.values(formContext.lastInput).join(' ') : '';
        const hasEdited = resultText !== originalText;
        
        if (hasEdited) {
            showToast('✅ 已使用编辑后的文本进行智能解析', 'success');
        }
        
        // 展示AI处理过渡
        closeVoiceModal();
        showAIProcessing(resultText);
    } else {
        showToast('请先输入或编辑识别结果', 'warning');
    }
};

// 完成录音并进入下一步（模拟）
window.finishRecording = function() {
    // 若还在录音，先停下
    if (isRecording) {
        isRecording = false;
        stopRecordingTimer();
        stopRealtimeText();
    }
    const finalText = document.getElementById('realtimeText')?.textContent || '';
    // 根据当前页面类型提供不同的默认示例
    const currentPageElement = document.getElementById('phoneContent');
    const isNewFarmPlan = currentPageElement && currentPageElement.innerHTML.includes('新建农事方案');
    const isFarmPlanStep2 = currentPageElement && currentPageElement.innerHTML.includes('农事方案计划');
    
    let defaultTranscript;
    if (isNewFarmPlan && !isFarmPlanStep2) {
        // 新建农事方案第一步示例
        defaultTranscript = '我要创建一个水仙花种植方案，方案名称是8月管理1号方案，所在区域是大厅水培植物基地，种植面积1亩，预计亩均产量500公斤，预计亩均成本2000元，预计亩均收入3000元，指导专家是张教授，所属单位是农业技术推广站';
    } else if (isFarmPlanStep2) {
        // 新建农事方案第二步示例
        defaultTranscript = '我要添加一个打药计划，时间是从8月18日到8月20日，农事类型是打药，活动名称是第一季度打药作业活动，作物是冬小麦，建议注意天气条件进行打药作业';
    } else {
        // 原有的添加农事活动示例
        defaultTranscript = '我要为大厅水培植物基地的水仙花安排打药活动，时间是明天上午9点到11点，负责人是王成龙';
    }
    
    const transcript = finalText || defaultTranscript;
    showResultState(transcript);
};

// 展示AI处理过渡
function showAIProcessing(transcript) {
    const modal = document.getElementById('aiProcessingModal');
    const timeline = document.getElementById('processingTimeline').querySelectorAll('.step');
    const varList = document.getElementById('extractedVariables');
    
    if (!modal || !timeline || !varList) return;
    
    // 清理状态
    modal.classList.add('show');
    timeline.forEach(s => s.classList.remove('active'));
    varList.innerHTML = '';
    
    // 检测当前页面类型
    const currentPageElement = document.getElementById('phoneContent');
    const isNewFarmPlan = currentPageElement && currentPageElement.innerHTML.includes('新建农事方案');
    const isFarmPlanStep2 = currentPageElement && currentPageElement.innerHTML.includes('农事方案计划');
    
    let parsed, mapping;
    if (isNewFarmPlan && !isFarmPlanStep2) {
        // 新建农事方案第一步：基础信息
        parsed = parseVoiceToFarmPlanData(transcript);
        mapping = {
            planName: '方案名称',
            location: '所在地域',
            cropType: '种植作物',
            cropVariety: '作物品种',
            startTime: '种植开始时间',
            endTime: '种植结束时间',
            plantingArea: '种植面积',
            expectedYield: '预计亩均产量',
            expectedCost: '预计亩均成本',
            expectedIncome: '预计亩均收入',
            expert: '指导专家',
            organization: '所属单位'
        };
    } else if (isFarmPlanStep2) {
        // 新建农事方案第二步：方案计划
        parsed = parseVoiceToFarmPlanStep2Data(transcript);
        mapping = {
            planStartDate: '计划开始日期',
            planEndDate: '计划结束日期',
            farmActivityType: '农事类型',
            activityName: '活动名称',
            cropType: '作物',
            suggestion: '建议'
        };
    } else {
        // 原有的添加农事活动页面
        parsed = parseVoiceToFormData(transcript);
        mapping = {
            plantingPlan: '种植计划',
            basePlot: '基地地块',
            crop: '作物',
            activityType: '农事类型',
            activityName: '活动名称',
            startTime: '开始时间',
            endTime: '结束时间',
            personInCharge: '负责人',
            remarks: '备注'
        };
    }
    
    const steps = [
        () => timeline[0].classList.add('active'),
        () => timeline[1].classList.add('active'),
        () => {
            timeline[2].classList.add('active');
            // 渲染变量
            Object.keys(parsed).forEach(key => {
                const value = parsed[key];
                if (!value) return;
                const item = document.createElement('div');
                item.className = 'var-item';
                item.innerHTML = `<span class="var-name">${mapping[key] || key}</span><span class="var-value">${value}</span>`;
                varList.appendChild(item);
            });
        },
        () => timeline[3].classList.add('active'),
        () => {
            timeline[4].classList.add('active');
            // 开始3秒倒计时
            startCountdown(() => {
                if (isNewFarmPlan && !isFarmPlanStep2) {
                    fillFarmPlanForm(parsed);
                } else if (isFarmPlanStep2) {
                    createNewFarmPlan(parsed);
                } else {
                    parseAndFillForm(transcript);
                }
                hideAIProcessing();
                showToast(isFarmPlanStep2 ? '农事计划已创建完成！' : '表单已自动填充完成！');
            });
        }
    ];
    
    // 依次推进步骤
    let idx = 0;
    const advance = () => {
        if (idx >= steps.length) return;
        steps[idx++]();
        if (idx < steps.length) setTimeout(advance, 600);
    };
    advance();
}

function hideAIProcessing() {
    const modal = document.getElementById('aiProcessingModal');
    if (modal) modal.classList.remove('show');
}

// 倒计时功能
function startCountdown(callback) {
    let count = 3;
    const timerElement = document.getElementById('countdownTimer');
    
    const countdown = setInterval(() => {
        count--;
        if (timerElement) {
            timerElement.textContent = count;
        }
        
        if (count <= 0) {
            clearInterval(countdown);
            if (callback) callback();
        }
    }, 1000);
}

// 显示初始状态（已废弃，直接开始录音）
function showInitialState() {
    // 不再需要初始状态，直接开始录音
    startRecording();
}

// 显示录音状态
function showRecordingState() {
    console.log('showRecordingState 被调用');
    const recordingElement = document.getElementById('voiceRecording');
    const resultElement = document.getElementById('voiceResult');
    
    console.log('recordingElement:', recordingElement);
    console.log('resultElement:', resultElement);
    
    if (recordingElement) {
        recordingElement.style.display = 'block';
        console.log('设置录音状态为显示');
    }
    if (resultElement) resultElement.style.display = 'none';
}

// 显示结果状态
function showResultState(transcript) {
    const recordingElement = document.getElementById('voiceRecording');
    const resultElement = document.getElementById('voiceResult');
    const resultTextEditable = document.getElementById('resultTextEditable');
    
    if (recordingElement) recordingElement.style.display = 'none';
    if (resultElement) resultElement.style.display = 'block';
    
    if (resultTextEditable) {
        resultTextEditable.value = transcript;
        // 自动聚焦到文本框
        resultTextEditable.focus();
        // 选中所有文本，方便用户编辑
        resultTextEditable.select();
        
        // 添加键盘事件监听
        resultTextEditable.addEventListener('keydown', function(e) {
            // Ctrl+Enter 或 Cmd+Enter 确认使用
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                confirmResult();
            }
            // Esc 键重新录音
            if (e.key === 'Escape') {
                e.preventDefault();
                reRecord();
            }
        });
        
        // 移除快捷键提示，改为在模态框内显示
    }
}

// 显示错误状态
function showErrorState(error) {
    let errorMessage = '语音识别失败';
    switch(error) {
        case 'no-speech':
            errorMessage = '没有检测到语音，请重试';
            break;
        case 'audio-capture':
            errorMessage = '无法访问麦克风，请检查权限';
            break;
        case 'not-allowed':
            errorMessage = '麦克风权限被拒绝';
            break;
        case 'network':
            errorMessage = '网络连接错误';
            break;
    }
    
    showToast(errorMessage);
    // 错误后直接重新开始录音
    setTimeout(() => {
        startRecording();
    }, 1000);
}

// 开始录音计时器
function startRecordingTimer() {
    recordingStartTime = Date.now();
    recordingTimer = setInterval(updateRecordingTime, 1000);
}

// 停止录音计时器
function stopRecordingTimer() {
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
}

// 更新录音时间显示
function updateRecordingTime() {
    if (recordingStartTime) {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('recordingTime').textContent = timeString;
    }
}

// 智能AI解析语音并填充表单
function parseAndFillForm(transcript) {
    console.log('智能解析语音输入:', transcript);
    
    // 显示AI解析开始提示
    showToast('🤖 AI正在智能解析您的语音...', 'info');
    
    // 分析用户意图
    const intent = analyzeUserIntent(transcript);
    console.log('识别到的意图:', intent);
    
    // 解析语音数据
    const parsedData = parseVoiceToFormData(transcript);
    console.log('解析的数据:', parsedData);
    
    // 显示解析结果
    setTimeout(() => {
        const intentText = intent.type === INTENT_TYPES.MODIFY_FIELD ? '修改模式' : 
                          intent.type === INTENT_TYPES.CORRECT_ERROR ? '纠正模式' : '全新输入模式';
        showToast(`🔍 AI识别：${intentText}，置信度：${Math.round(intent.confidence * 100)}%`, 'info');
    }, 500);
    
    // 智能填充表单
    setTimeout(() => {
        smartFillForm(parsedData, intent);
    }, 1000);
    
    // 更新上下文
    updateFormContext(parsedData, intent);
}

// 意图类型定义
const INTENT_TYPES = {
    NEW_INPUT: 'new_input',      // 全新输入
    MODIFY_FIELD: 'modify_field', // 修改特定字段
    CORRECT_ERROR: 'correct_error' // 纠正错误
};

// 字段关键词映射
const FIELD_KEYWORDS = {
    'crop': ['作物', '种植', '品种', '植物', '种什么'],
    'activityType': ['农事类型', '活动类型', '作业类型', '做什么'],
    'activityName': ['活动名称', '作业名称', '叫什么'],
    'startTime': ['开始时间', '开始', '时间', '什么时候'],
    'endTime': ['结束时间', '结束', '到几点'],
    'basePlot': ['基地', '地块', '区域', '分区', '在哪里'],
    'person': ['负责人', '谁负责', '谁来', '负责人是谁']
};

// 表单上下文管理
let formContext = {
    lastInput: null,
    filledFields: {},
    modificationHistory: [],
    lastModificationTime: null
};

// 分析用户意图
function analyzeUserIntent(transcript) {
    console.log('分析用户意图:', transcript);
    
    // 检查是否有明确修改意图
    const modifyKeywords = ['修改', '更改', '错了', '不对', '应该是', '改成', '不是', '而是', '改为'];
    const hasModifyIntent = modifyKeywords.some(keyword => 
        transcript.includes(keyword)
    );
    
    // 检查是否有纠正错误意图
    const correctKeywords = ['错了', '不对', '不是', '而是', '应该是'];
    const hasCorrectIntent = correctKeywords.some(keyword => 
        transcript.includes(keyword)
    );
    
    // 识别具体要修改的字段
    const targetFields = identifyTargetFields(transcript);
    console.log('识别到的目标字段:', targetFields);
    
    // 判断意图类型
    if (hasCorrectIntent && targetFields.length > 0) {
        return {
            type: INTENT_TYPES.CORRECT_ERROR,
            targetFields: targetFields,
            confidence: 0.9
        };
    } else if (hasModifyIntent && targetFields.length > 0) {
        return {
            type: INTENT_TYPES.MODIFY_FIELD,
            targetFields: targetFields,
            confidence: 0.8
        };
    } else {
        return {
            type: INTENT_TYPES.NEW_INPUT,
            targetFields: Object.keys(FIELD_KEYWORDS),
            confidence: 0.7
        };
    }
}

// 识别目标字段
function identifyTargetFields(transcript) {
    const targetFields = [];
    
    Object.keys(FIELD_KEYWORDS).forEach(fieldId => {
        const keywords = FIELD_KEYWORDS[fieldId];
        const hasKeyword = keywords.some(keyword => 
            transcript.includes(keyword)
        );
        
        if (hasKeyword) {
            targetFields.push(fieldId);
        }
    });
    
    return targetFields;
}

// 智能填充表单
function smartFillForm(parsedData, intent) {
    console.log('智能填充表单:', parsedData, intent);
    
    if (intent.type === INTENT_TYPES.MODIFY_FIELD || intent.type === INTENT_TYPES.CORRECT_ERROR) {
        // 只更新指定字段
        intent.targetFields.forEach(fieldId => {
            if (parsedData[fieldId]) {
                updateField(fieldId, parsedData[fieldId], 'modify');
            }
        });
        
        // 显示修改提示
        showModificationHint(intent.targetFields, parsedData);
    } else {
        // 全新输入，填充所有字段
        Object.keys(parsedData).forEach(fieldId => {
            updateField(fieldId, parsedData[fieldId], 'new');
        });
        
        // 显示填充提示
        showFillHint(Object.keys(parsedData), parsedData);
    }
}

// 更新字段
function updateField(fieldId, value, updateType) {
    const element = document.getElementById(fieldId);
    if (element) {
        // 添加修改动画
        element.classList.add('field-updating');
        element.value = value;
        
        // 更新上下文
        formContext.filledFields[fieldId] = value;
        
        // 移除动画
        setTimeout(() => {
            element.classList.remove('field-updating');
        }, 500);
        
        console.log(`${updateType === 'modify' ? '修改' : '填充'}字段 ${fieldId}: ${value}`);
    }
}

// 显示修改提示
function showModificationHint(targetFields, parsedData) {
    const fieldNames = {
        'crop': '作物',
        'activityType': '农事类型',
        'activityName': '活动名称',
        'startTime': '开始时间',
        'endTime': '结束时间',
        'basePlot': '基地地块',
        'person': '负责人'
    };
    
    const modifiedFields = targetFields.map(fieldId => {
        const fieldName = fieldNames[fieldId] || fieldId;
        const newValue = parsedData[fieldId];
        return `${fieldName}(${newValue})`;
    }).join('、');
    
    const message = `✅ 智能修改：${modifiedFields}`;
    showToast(message, 'success');
    
    // 显示详细信息
    setTimeout(() => {
        const detailMessage = `AI识别到您要修改特定字段，已智能更新相关内容`;
        showToast(detailMessage, 'info');
    }, 1000);
}

// 显示填充提示
function showFillHint(filledFields, parsedData) {
    const fieldNames = {
        'crop': '作物',
        'activityType': '农事类型',
        'activityName': '活动名称',
        'startTime': '开始时间',
        'endTime': '结束时间',
        'basePlot': '基地地块',
        'person': '负责人'
    };
    
    const filledFieldNames = filledFields.map(fieldId => {
        const fieldName = fieldNames[fieldId] || fieldId;
        const value = parsedData[fieldId];
        return `${fieldName}(${value})`;
    }).join('、');
    
    const message = `🎯 智能填充：${filledFieldNames}`;
    showToast(message, 'success');
    
    // 显示详细信息
    setTimeout(() => {
        const detailMessage = `AI已识别并填充所有相关字段，您可以继续修改或确认`;
        showToast(detailMessage, 'info');
    }, 1000);
}

// 更新表单上下文
function updateFormContext(newData, intent) {
    formContext.lastInput = newData;
    formContext.lastModificationTime = Date.now();
    
    formContext.modificationHistory.push({
        timestamp: Date.now(),
        intent: intent,
        changes: newData
    });
    
    // 保持历史记录在合理范围内
    if (formContext.modificationHistory.length > 10) {
        formContext.modificationHistory.shift();
    }
    
    console.log('更新表单上下文:', formContext);
}

// 语音解析为表单数据
function parseVoiceToFormData(transcript) {
    const data = {};
    
    // 解析基地地块
    const basePlotMatch = transcript.match(/(大厅水培植物|基地|地块)/g);
    if (basePlotMatch) {
        data.basePlot = '大厅水培植物 | 一号分区 | 一号基地(水培区 | 一号地块)';
    }
    
    // 解析作物 - 增强识别
    const cropMatch = transcript.match(/(水仙花|小麦|玉米|水稻|大豆|冬小麦|春小麦|棉花|蔬菜|水果)/);
    if (cropMatch) {
        data.crop = cropMatch[0];
    }
    
    // 解析农事类型 - 增强识别
    const activityTypeMatch = transcript.match(/(打药|施肥|浇水|除草|播种|收获|修剪|采摘|移栽|松土)/);
    if (activityTypeMatch) {
        data.activityType = activityTypeMatch[0];
    }
    
    // 解析活动名称
    if (activityTypeMatch) {
        data.activityName = `${activityTypeMatch[0]}活动`;
    }
    
    // 解析时间 - 增强识别
    const timeMatch = transcript.match(/(明天|今天|后天)?\s*(上午|下午|晚上)?\s*(\d{1,2})[点时:：](\d{0,2})?\s*(到|至)\s*(\d{1,2})[点时:：](\d{0,2})?/);
    if (timeMatch) {
        const startHour = timeMatch[3];
        const startMinute = timeMatch[4] || '00';
        const endHour = timeMatch[6];
        const endMinute = timeMatch[7] || '00';
        
        // 处理上午下午
        let startTime = `${startHour.padStart(2, '0')}:${startMinute}`;
        let endTime = `${endHour.padStart(2, '0')}:${endMinute}`;
        
        if (timeMatch[2] === '下午' || timeMatch[2] === '晚上') {
            startTime = `${parseInt(startHour) + 12}:${startMinute}`;
            endTime = `${parseInt(endHour) + 12}:${endMinute}`;
        }
        
        data.startTime = startTime;
        data.endTime = endTime;
    }
    
    // 解析负责人 - 增强识别
    const personMatch = transcript.match(/(王成龙|张三|李四|王五|赵六|钱七|孙八|周九|吴十)/);
    if (personMatch) {
        data.personInCharge = personMatch[0];
    }
    
    // 解析种植计划
    if (data.crop && data.activityType) {
        data.plantingPlan = `${data.crop}${data.activityType}计划`;
    }
    
    // 解析备注
    const remarksMatch = transcript.match(/(备注|说明|注意|要求)[：:]\s*(.+)/);
    if (remarksMatch) {
        data.remarks = remarksMatch[2];
    }
    
    return data;
}

// 解析语音到农事方案基础信息数据
function parseVoiceToFarmPlanData(transcript) {
    const data = {};
    
    // 智能检测：如果语音内容明显是农事活动相关，尝试转换为方案信息
    if (transcript.includes('安排') && transcript.includes('活动')) {
        // 从农事活动语音中提取方案信息
        const cropMatch = transcript.match(/(水仙花|小麦|玉米|水稻|大豆|冬小麦|春小麦|花卉|番茄|黄瓜|白菜|萝卜)/);
        if (cropMatch) {
            data.cropType = cropMatch[0];
            data.planName = `${cropMatch[0]}种植方案`;
        }
        
        // 提取基地信息作为所在地域
        if (transcript.includes('大厅水培植物基地')) {
            data.location = '大厅水培植物基地';
        }
        
        // 提取时间信息
        const timeMatch = transcript.match(/(明天|后天|下周|下个月|本月)?\s*(上午|下午|晚上)?\s*(\d{1,2})[点时:：](\d{0,2})?\s*(到|至)\s*(\d{1,2})[点时:：](\d{0,2})?/);
        if (timeMatch) {
            const startHour = timeMatch[3];
            const startMinute = timeMatch[4] || '00';
            const endHour = timeMatch[6];
            const endMinute = timeMatch[7] || '00';
            
            let startTime = `${startHour.padStart(2, '0')}:${startMinute}`;
            let endTime = `${endHour.padStart(2, '0')}:${endMinute}`;
            
            if (timeMatch[2] === '下午' || timeMatch[2] === '晚上') {
                startTime = `${parseInt(startHour) + 12}:${startMinute}`;
                endTime = `${parseInt(endHour) + 12}:${endMinute}`;
            }
            
            data.startTime = startTime;
            data.endTime = endTime;
        }
        
        // 提取负责人信息
        const personMatch = transcript.match(/(负责人|负责人是|负责人为)([^，,。!！\s]*)/);
        if (personMatch) {
            data.expert = personMatch[2];
        }
        
        // 设置默认值
        if (!data.plantingArea) data.plantingArea = '1亩';
        if (!data.expectedYield) data.expectedYield = '500';
        if (!data.expectedCost) data.expectedCost = '2000';
        if (!data.expectedIncome) data.expectedIncome = '3000';
        if (!data.cropVariety) data.cropVariety = '1号';
        if (!data.organization) data.organization = '农业技术推广站';
        
        return data;
    }
    
    // 原有的方案信息解析逻辑
    // 解析方案名称 - 更宽泛的匹配
    const planNameMatch = transcript.match(/(方案名称是|叫做|命名为|创建|建立|制定)([^，,。!！]*[方案计划])/);
    if (planNameMatch) {
        data.planName = planNameMatch[2].trim();
    } else if (transcript.includes('方案')) {
        // 从语音中提取作物名称来生成方案名称
        const cropMatch = transcript.match(/(水仙花|小麦|玉米|水稻|大豆|冬小麦|春小麦|花卉)/);
        if (cropMatch) {
            data.planName = `${cropMatch[0]}种植方案`;
        } else {
            data.planName = '农事种植方案';
        }
    }
    
    // 解析所在地域 - 更灵活的匹配
    const locationMatch = transcript.match(/(所在地域|地区|区域|地方|位置)[是在为：:]?\s*([^，,。!！\s]*[省市县区乡镇村])/);
    if (locationMatch) {
        data.location = locationMatch[2];
    } else {
        // 尝试匹配地名模式
        const placeMatch = transcript.match(/([^，,。!！\s]*[省市县区乡镇村])/);
        if (placeMatch) {
            data.location = placeMatch[0];
        } else if (transcript.includes('大厅') || transcript.includes('基地')) {
            data.location = '大厅水培植物基地';
        }
    }
    
    // 解析种植作物 - 扩展匹配范围
    const cropMatch = transcript.match(/(水仙花|小麦|玉米|水稻|大豆|冬小麦|春小麦|花卉|番茄|黄瓜|白菜|萝卜)/);
    if (cropMatch) {
        data.cropType = cropMatch[0];
    }
    
    // 解析作物品种 - 更灵活的数字匹配
    const varietyMatch = transcript.match(/(品种是|品种为|品种)([^，,。!！\s]*[号])/);
    if (varietyMatch) {
        data.cropVariety = varietyMatch[2];
    } else {
        // 匹配数字+号的模式
        const numberMatch = transcript.match(/([0-9一二三四五六七八九十]+)[号]/);
        if (numberMatch) {
            data.cropVariety = numberMatch[0];
        }
    }
    
    // 解析种植面积 - 支持多种表达方式
    const areaMatch = transcript.match(/([0-9一二三四五六七八九十]+)\s*(亩|平方米|公顷)/);
    if (areaMatch) {
        let area = areaMatch[1];
        // 转换中文数字
        const chineseNumbers = {'一': '1', '二': '2', '三': '3', '四': '4', '五': '5', '六': '6', '七': '7', '八': '8', '九': '9', '十': '10'};
        if (chineseNumbers[area]) {
            area = chineseNumbers[area];
        }
        data.plantingArea = area + areaMatch[2];
    }
    
    // 解析预计亩均产量 - 更全面的单位支持
    const yieldMatch = transcript.match(/(产量|亩产|收成)[是为：:]?\s*([0-9]+)\s*(公斤|千克|kg|斤|吨)/);
    if (yieldMatch) {
        data.expectedYield = yieldMatch[2];
    } else {
        // 直接匹配数字+重量单位
        const directYieldMatch = transcript.match(/([0-9]+)\s*(公斤|千克|kg)/);
        if (directYieldMatch) {
            data.expectedYield = directYieldMatch[1];
        }
    }
    
    // 解析预计亩均成本 - 支持多种表达
    const costMatch = transcript.match(/(成本|投入|费用)[是为：:]?\s*([0-9]+)\s*元/);
    if (costMatch) {
        data.expectedCost = costMatch[2];
    } else {
        // 匹配"X元成本"的模式
        const reverseCostMatch = transcript.match(/([0-9]+)\s*元\s*(成本|投入|费用)/);
        if (reverseCostMatch) {
            data.expectedCost = reverseCostMatch[1];
        }
    }
    
    // 解析预计亩均收入 - 支持多种表达
    const incomeMatch = transcript.match(/(收入|收益|利润)[是为：:]?\s*([0-9]+)\s*元/);
    if (incomeMatch) {
        data.expectedIncome = incomeMatch[2];
    } else {
        // 匹配"X元收入"的模式
        const reverseIncomeMatch = transcript.match(/([0-9]+)\s*元\s*(收入|收益|利润)/);
        if (reverseIncomeMatch) {
            data.expectedIncome = reverseIncomeMatch[1];
        }
    }
    
    // 解析指导专家 - 扩展姓名匹配
    const expertMatch = transcript.match(/(指导专家|专家|负责人)[是为：:]?\s*([^，,。!！\s]*[授师长生员]|[王李张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁][^，,。!！\s]*)/);
    if (expertMatch) {
        data.expert = expertMatch[2];
    }
    
    // 解析所属单位 - 扩展机构匹配
    const orgMatch = transcript.match(/(所属单位|单位|机构|组织)[是为：:]?\s*([^，,。!！\s]*[站所院校司厂社区村委会])/);
    if (orgMatch) {
        data.organization = orgMatch[2];
    } else {
        // 匹配常见机构后缀
        const institutionMatch = transcript.match(/([^，,。!！\s]*[站所院校司厂社区村委会])/);
        if (institutionMatch) {
            data.organization = institutionMatch[0];
        }
    }
    
    // 解析种植周期 - 支持多种日期格式
    const timeRangeMatch = transcript.match(/(\d{1,2}月\d{1,2}日?)[到至~](\d{1,2}月\d{1,2}日?)/);
    if (timeRangeMatch) {
        data.startTime = timeRangeMatch[1];
        data.endTime = timeRangeMatch[2];
    } else {
        // 匹配年份+月日的格式
        const yearTimeMatch = transcript.match(/(20\d{2}年)?(\d{1,2}月\d{1,2}日?)[到至~](20\d{2}年)?(\d{1,2}月\d{1,2}日?)/);
        if (yearTimeMatch) {
            data.startTime = yearTimeMatch[2];
            data.endTime = yearTimeMatch[4];
        }
    }
    
    return data;
}

// 解析语音到农事方案计划数据
function parseVoiceToFarmPlanStep2Data(transcript) {
    const data = {};
    
    // 解析日期范围 - 支持更多格式
    const dateRangeMatch = transcript.match(/(\d{1,2}月\d{1,2}日?)[到至~](\d{1,2}月\d{1,2}日?)/);
    if (dateRangeMatch) {
        data.planStartDate = '当年' + dateRangeMatch[1];
        data.planEndDate = '当年' + dateRangeMatch[2];
    } else {
        // 匹配相对时间表达
        const relativeTimeMatch = transcript.match(/(明天|后天|下周|下个月|本月)/);
        if (relativeTimeMatch) {
            const today = new Date();
            let startDate, endDate;
            
            switch(relativeTimeMatch[1]) {
                case '明天':
                    startDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                    endDate = startDate;
                    break;
                case '后天':
                    startDate = new Date(today.getTime() + 48 * 60 * 60 * 1000);
                    endDate = startDate;
                    break;
                default:
                    startDate = today;
                    endDate = today;
            }
            
            const formatDate = (date) => `${date.getMonth() + 1}月${date.getDate()}日`;
            data.planStartDate = '当年' + formatDate(startDate);
            data.planEndDate = '当年' + formatDate(endDate);
        }
    }
    
    // 解析农事类型 - 扩展类型识别
    const activityTypeMatch = transcript.match(/(打药|施肥|浇水|除草|播种|收获|修剪|松土|灌溉|翻地|间苗|移栽|嫁接)/);
    if (activityTypeMatch) {
        data.farmActivityType = activityTypeMatch[0];
    } else {
        // 通过动作词推断农事类型
        if (transcript.includes('安排') && transcript.includes('活动')) {
            const actionMatch = transcript.match(/(安排|进行|执行)([^，,。!！]*)(活动|作业|工作)/);
            if (actionMatch) {
                const action = actionMatch[2];
                if (action.includes('药')) data.farmActivityType = '打药';
                else if (action.includes('肥')) data.farmActivityType = '施肥';
                else if (action.includes('水')) data.farmActivityType = '浇水';
                else if (action.includes('草')) data.farmActivityType = '除草';
            }
        }
    }
    
    // 解析活动名称 - 更智能的生成
    const activityNameMatch = transcript.match(/(活动名称|名称)[是为：:]?\s*([^，,。!！]*)/);
    if (activityNameMatch && activityNameMatch[2].trim()) {
        data.activityName = activityNameMatch[2].trim();
    } else if (data.farmActivityType) {
        // 根据时间和类型智能生成名称
        const seasonMap = {
            '春': ['3月', '4月', '5月'],
            '夏': ['6月', '7月', '8月'],
            '秋': ['9月', '10月', '11月'],
            '冬': ['12月', '1月', '2月']
        };
        
        let season = '第一季度';
        const currentMonth = new Date().getMonth() + 1;
        for (const [seasonName, months] of Object.entries(seasonMap)) {
            if (months.some(m => m.includes(currentMonth.toString()))) {
                season = seasonName + '季';
                break;
            }
        }
        
        data.activityName = `${season} | ${data.farmActivityType}作业活动`;
    } else {
        data.activityName = '农事管理活动';
    }
    
    // 解析作物 - 扩展作物识别
    const cropMatch = transcript.match(/(作物|种植)[是为：:]?\s*([^，,。!！\s]*[麦花稻豆菜瓜果])/);
    if (cropMatch) {
        data.cropType = cropMatch[2];
    } else {
        // 直接匹配作物名称
        const directCropMatch = transcript.match(/(水仙花|小麦|玉米|水稻|大豆|冬小麦|春小麦|花卉|番茄|黄瓜|白菜|萝卜)/);
        if (directCropMatch) {
            data.cropType = directCropMatch[0];
        }
    }
    
    // 解析建议 - 更智能的建议生成
    const suggestionMatch = transcript.match(/(建议|推荐|提示)[是为进行：:]?\s*([^，,。!！]*)/);
    if (suggestionMatch && suggestionMatch[2].trim()) {
        data.suggestion = suggestionMatch[2].trim();
    } else if (data.farmActivityType) {
        // 根据农事类型生成具体建议
        const suggestionMap = {
            '打药': '注意天气条件，选择无风晴天进行打药作业',
            '施肥': '根据土壤肥力检测结果，合理配比肥料用量',
            '浇水': '根据土壤湿度和天气情况，适量浇水',
            '除草': '人工除草结合机械除草，保护作物根系',
            '播种': '选择优质种子，注意播种深度和密度',
            '收获': '选择适宜天气，及时收获确保品质'
        };
        data.suggestion = suggestionMap[data.farmActivityType] || `${data.farmActivityType}作业`;
    } else {
        data.suggestion = '按标准流程执行';
    }
    
    return data;
}

// 填充农事方案表单
function fillFarmPlanForm(data) {
    const fieldMapping = {
        planName: 'planName',
        location: 'location',
        cropType: 'cropType',
        cropVariety: 'cropVariety',
        startTime: 'startTime',
        endTime: 'endTime',
        plantingArea: 'plantingArea',
        expectedYield: 'expectedYield',
        expectedCost: 'expectedCost',
        expectedIncome: 'expectedIncome',
        expert: 'expert',
        organization: 'organization'
    };
    
    Object.keys(fieldMapping).forEach(key => {
        const value = data[key];
        const fieldId = fieldMapping[key];
        if (value && fieldId) {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = value;
                element.classList.add('ai-filled');
                // 移除动画类
                setTimeout(() => element.classList.remove('ai-filled'), 500);
            }
        }
    });
}

// 创建新的农事计划
function createNewFarmPlan(data) {
    // 这里可以实现创建新计划卡片的逻辑
    console.log('创建新的农事计划:', data);
    
    // 模拟添加新计划卡片到页面
    const planSection = document.querySelector('.mobile-content');
    if (planSection && data.farmActivityType) {
        const newPlanCard = document.createElement('div');
        newPlanCard.className = 'plan-card';
        newPlanCard.innerHTML = `
            <div class="plan-card-header">
                <div class="plan-date">
                    <i class="fas fa-clock"></i>
                    <span>${data.planStartDate || '当年08月18日'}~${data.planEndDate || '当年08月20日'}</span>
                </div>
                <div class="plan-options">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            <div class="plan-card-content">
                <div class="plan-detail-item">
                    <span class="detail-label">农事类型:</span>
                    <span class="detail-value">${data.farmActivityType || '打药'}</span>
                </div>
                <div class="plan-detail-item">
                    <span class="detail-label">活动名称:</span>
                    <span class="detail-value">${data.activityName || '新增农事活动'}</span>
                </div>
                <div class="plan-detail-item">
                    <span class="detail-label">作物:</span>
                    <span class="detail-value">${data.cropType || '冬小麦'}</span>
                </div>
                <div class="plan-detail-item">
                    <span class="detail-label">建议:</span>
                    <span class="detail-value">${data.suggestion || '按计划执行'}</span>
                </div>
            </div>
        `;
        
        // 添加动画效果
        newPlanCard.style.opacity = '0';
        newPlanCard.style.transform = 'translateY(20px)';
        
        // 插入到现有计划卡片后面
        const existingCard = planSection.querySelector('.plan-card');
        if (existingCard) {
            existingCard.parentNode.insertBefore(newPlanCard, existingCard.nextSibling);
        } else {
            planSection.appendChild(newPlanCard);
        }
        
        // 显示动画
        setTimeout(() => {
            newPlanCard.style.transition = 'all 0.3s ease';
            newPlanCard.style.opacity = '1';
            newPlanCard.style.transform = 'translateY(0)';
        }, 100);
    }
}

// 页面加载完成后初始化语音识别
document.addEventListener('DOMContentLoaded', function() {
    // 原有的初始化代码...
    
    // 初始化语音识别
    initSpeechRecognition();
});

// 暂停录音
window.pauseRecording = function() {
    if (isRecording && !isPaused) {
        isPaused = true;
        stopRealtimeText();
        stopInactivityTimer();
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('continueBtn').style.display = 'flex';
        document.querySelector('.recording-text').textContent = '录音已暂停';
    }
};

// 继续录音
window.continueRecording = function() {
    if (isRecording && isPaused) {
        isPaused = false;
        startRealtimeText();
        startInactivityTimer();
        lastRealtimeUpdateTs = Date.now();
        document.getElementById('pauseBtn').style.display = 'flex';
        document.getElementById('continueBtn').style.display = 'none';
        document.querySelector('.recording-text').textContent = '正在录音，请说话...';
    }
};

// 开始实时回显文字
function startRealtimeText() {
    if (realtimeTextTimer) {
        clearInterval(realtimeTextTimer);
    }
    
    realtimeTextTimer = setInterval(() => {
        if (isRecording && !isPaused && textIndex < mockTexts.length) {
            currentText = mockTexts[textIndex];
            const realtimeTextElement = document.getElementById('realtimeText');
            if (realtimeTextElement) {
                realtimeTextElement.textContent = currentText;
                realtimeTextElement.classList.add('typing');
            }
            textIndex++;
            lastRealtimeUpdateTs = Date.now();
        }
    }, 1000); // 每秒更新一次文字
}

// 停止实时回显文字
function stopRealtimeText() {
    if (realtimeTextTimer) {
        clearInterval(realtimeTextTimer);
        realtimeTextTimer = null;
    }
    
    const realtimeTextElement = document.getElementById('realtimeText');
    if (realtimeTextElement) {
        realtimeTextElement.classList.remove('typing');
    }
}

// 未录入超时检测（30秒）
function startInactivityTimer() {
    stopInactivityTimer();
    inactivityCheckTimer = setInterval(() => {
        if (!isRecording || isPaused) return;
        const now = Date.now();
        if (now - lastRealtimeUpdateTs >= 30000) { // 30秒无更新
            isRecording = false;
            stopRecordingTimer();
            stopRealtimeText();
            stopInactivityTimer();
            const realtimeTextElement = document.getElementById('realtimeText');
            if (realtimeTextElement && realtimeTextElement.textContent.trim() === '') {
                // 完全没有内容
                showToast('长时间未录入，已停止录入');
            } else {
                // 有部分内容，仍提示停止
                showToast('长时间未录入，已停止录入');
            }
            // 超时后直接重新开始录音
            setTimeout(() => {
                startRecording();
            }, 2000);
        }
    }, 1000);
}

function stopInactivityTimer() {
    if (inactivityCheckTimer) {
        clearInterval(inactivityCheckTimer);
        inactivityCheckTimer = null;
    }
}

// ===== 气象灾害智能体功能 =====
// 加载气象灾害预警主页
function loadWeatherDisasterHome() {
    loadPage('weatherDisasterHome');
    // 页面加载后，创建弹窗并添加到body
    setTimeout(() => {
        createWeatherExamplesModal();
    }, 100);
}

// 创建气象例子弹窗（如果不存在）
function createWeatherExamplesModal() {
    // 如果弹窗已存在，先移除
    const existingModal = document.getElementById('weatherExamplesModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 获取手机内容容器
    const phoneContent = document.getElementById('phoneContent');
    if (!phoneContent) {
        console.error('phoneContent not found!');
        return;
    }
    
    // 创建新的弹窗
    const modal = document.createElement('div');
    modal.id = 'weatherExamplesModal';
    modal.className = 'weather-examples-modal';
    modal.innerHTML = `
        <div class="weather-modal-overlay" onclick="hideWeatherExamplesModal()"></div>
        <div class="weather-modal-content">
            <div class="weather-modal-header">
                <h3>常见问题示例</h3>
                <button class="weather-modal-close" onclick="hideWeatherExamplesModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="weather-modal-body">
                <div class="weather-example-item" onclick="selectWeatherExample('柘城县未来7天天气如何？')">
                    <div class="weather-example-title">未来趋势</div>
                    <div class="weather-example-desc">柘城县未来7天天气如何？</div>
                </div>
                <div class="weather-example-item" onclick="selectWeatherExample('最近有什么预警信息？')">
                    <div class="weather-example-title">预警查询</div>
                    <div class="weather-example-desc">最近有什么预警信息？</div>
                </div>
                <div class="weather-example-item" onclick="selectWeatherExample('适合打药吗？')">
                    <div class="weather-example-title">农事建议</div>
                    <div class="weather-example-desc">适合打药吗？</div>
                </div>
                <div class="weather-example-item" onclick="selectWeatherExample('柘城县历史灾害统计')">
                    <div class="weather-example-title">历史统计</div>
                    <div class="weather-example-desc">柘城县历史灾害统计</div>
                </div>
                <div class="weather-example-item" onclick="selectWeatherExample('查询郑州市的预警信息')">
                    <div class="weather-example-title">跨区域查询</div>
                    <div class="weather-example-desc">查询郑州市的预警信息</div>
                </div>
                <div class="weather-example-item" onclick="selectWeatherExample('今天会下雨吗？')">
                    <div class="weather-example-title">实时天气</div>
                    <div class="weather-example-desc">今天会下雨吗？</div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到手机内容容器
    phoneContent.appendChild(modal);
    console.log('Weather examples modal created and added to phoneContent');
}

// 开始气象灾害预警主页对话
function startWeatherHomeChat() {
    const input = document.getElementById('weatherHomeInput');
    const message = input.value.trim();
    
    if (!message) {
        showNotification('请输入您的问题', 'warning');
        return;
    }
    
    // 跳转到气象灾害简报页面并发送消息
    loadWeatherDisasterAgent();
    setTimeout(() => {
        addWeatherMessage('user', message, 'text');
        handleWeatherQuery(message);
    }, 500);
}

// 显示气象例子弹窗
function showWeatherExamplesModal() {
    console.log('showWeatherExamplesModal called');
    
    // 确保弹窗存在
    let modal = document.getElementById('weatherExamplesModal');
    if (!modal) {
        createWeatherExamplesModal();
        modal = document.getElementById('weatherExamplesModal');
    }
    
    if (!modal) {
        console.error('Failed to create weather examples modal!');
        return;
    }
    
    // 确保弹窗在phoneContent内
    const phoneContent = document.getElementById('phoneContent');
    if (phoneContent && !phoneContent.contains(modal)) {
        phoneContent.appendChild(modal);
        console.log('Modal moved to phoneContent');
    }
    
    // 显示弹窗
    modal.classList.add('active');
    // 禁止手机内容区域滚动
    if (phoneContent) {
        phoneContent.style.overflow = 'hidden';
    }
    
    console.log('Modal shown, classes:', modal.className);
}

// 隐藏气象例子弹窗
function hideWeatherExamplesModal() {
    console.log('hideWeatherExamplesModal called');
    const modal = document.getElementById('weatherExamplesModal');
    if (modal) {
        modal.classList.remove('active');
        // 恢复手机内容区域滚动
        const phoneContent = document.getElementById('phoneContent');
        if (phoneContent) {
            phoneContent.style.overflow = '';
        }
        console.log('Modal hidden');
    }
}

// 选择气象例子
function selectWeatherExample(example) {
    hideWeatherExamplesModal();
    const input = document.getElementById('weatherHomeInput');
    if (input) {
        input.value = example;
        input.focus();
        // 自动发送消息
        setTimeout(() => {
            startWeatherHomeChat();
        }, 300);
    }
}

// 加载气象灾害简报页面
function loadWeatherDisasterAgent() {
    loadPage('weatherDisasterAgent');
    // 页面加载后自动初始化
    setTimeout(() => {
        initWeatherDisasterAgent();
    }, 100);
}

// 全局状态管理
let weatherAgentState = {
    lastGeneratedReport: null,  // 最后一次生成的报告
    userLocation: null,  // 用户位置
    availablePlots: []  // 可用地块列表
};

function initWeatherDisasterAgent() {
    const messagesContainer = document.getElementById('weatherMessages');
    if (!messagesContainer) return;
    
    // 清空消息
    messagesContainer.innerHTML = '';
    
    // 场景A：如果有历史报告，显示预览卡片 + 按钮
    if (weatherAgentState.lastGeneratedReport) {
        showWeatherResultPreview(weatherAgentState.lastGeneratedReport);
        showGenerateReportButton();
        // 后台获取位置，用于下次生成
        getUserLocationSilent();
    } else {
        // 首次进入：先获取位置，再显示地块选择器
        getUserLocationSilent((success) => {
            // 无论定位成功与否，都显示地块选择器
            setTimeout(() => {
                showBlockSelector();
            }, 100);
        });
    }
}

// 静默获取用户位置
function getUserLocationSilent(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                weatherAgentState.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                if (callback) callback(true);
            },
            () => {
                // 定位失败，不影响使用
                if (callback) callback(false);
            },
            { timeout: 2000, enableHighAccuracy: false }
        );
    } else {
        if (callback) callback(false);
    }
}

// 显示"生成地块报告"按钮
function showGenerateReportButton() {
    const messagesContainer = document.getElementById('weatherMessages');
    if (!messagesContainer) return;
    
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'weather-message ai-message generate-button-container';
    buttonDiv.innerHTML = `
        <div class="weather-message-content ai-content" style="width: 100%; align-items: center;">
            <button class="generate-report-btn" onclick="triggerBlockSelection()">
                <i class="fas fa-file-alt"></i>
                <span>生成地块报告</span>
            </button>
        </div>
    `;
    
    messagesContainer.appendChild(buttonDiv);
    
    // 滚动到底部
    const container = document.getElementById('weatherMessagesContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

function requestLocationPermission(autoInit = false) {
    if (!navigator.geolocation) {
        addWeatherMessage('ai', '您的设备不支持定位功能，请手动选择地块。', 'text');
        showLocationSelector();
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // 定位成功
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if (autoInit) {
                // 自动初始化，显示地块气象简报
                setTimeout(() => {
                    showWeatherBriefing(lat, lng);
                }, 1500);
            } else {
                addWeatherMessage('ai', `已获取您的位置：纬度 ${lat.toFixed(4)}，经度 ${lng.toFixed(4)}。正在为您分析地块气象...`, 'text');
                setTimeout(() => {
                    showWeatherBriefing(lat, lng);
                }, 1000);
            }
        },
        (error) => {
            // 定位失败
            if (autoInit) {
                addWeatherMessage('ai', '您好！为了提供精准的地块级服务，请授权位置信息，或手动告诉我想查询的区域。', 'text', [
                    { text: '📍 点击授权', action: 'requestLocation' },
                    { text: '手动选择地块', action: 'selectLocation' }
                ]);
            } else {
                addWeatherMessage('ai', '无法获取位置信息，请检查定位权限设置。', 'text');
            }
        },
        { timeout: 5000, enableHighAccuracy: true }
    );
}

// 模拟地块数据库
function getAllPlots() {
    return [
        {
            id: 'plot1',
            baseName: '腾跃示范基地',
            plotName: '1号地块',
            crop: '辣椒',
            growthStage: '坐果期',
            location: '柘城县',
            lat: 34.0865,
            lng: 115.6699
        },
        {
            id: 'plot2',
            baseName: '腾跃示范基地',
            plotName: '2号地块',
            crop: '玉米',
            growthStage: '抽穗期',
            location: '柘城县',
            lat: 34.0900,
            lng: 115.6750
        },
        {
            id: 'plot3',
            baseName: '东方红农场',
            plotName: 'A区地块',
            crop: '小麦',
            growthStage: '灌浆期',
            location: '柘城县',
            lat: 34.0850,
            lng: 115.6650
        },
        {
            id: 'plot4',
            baseName: '东方红农场',
            plotName: 'B区地块',
            crop: '大豆',
            growthStage: '开花期',
            location: '柘城县',
            lat: 34.0820,
            lng: 115.6600
        },
        {
            id: 'plot5',
            baseName: '绿源生态园',
            plotName: '南区地块',
            crop: '番茄',
            growthStage: '结果期',
            location: '柘城县',
            lat: 34.0890,
            lng: 115.6720
        },
        {
            id: 'plot6',
            baseName: '绿源生态园',
            plotName: '北区地块',
            crop: '黄瓜',
            growthStage: '开花期',
            location: '柘城县',
            lat: 34.0910,
            lng: 115.6780
        }
    ];
}

// 计算两点间距离（简化算法）
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 场景B：触发生成流程
function triggerBlockSelection() {
    // 移除之前的生成按钮
    const oldButton = document.querySelector('.generate-button-container');
    if (oldButton) oldButton.remove();
    
    // 显示地块选择器
    showBlockSelector();
}

// 显示地块选择器组件
function showBlockSelector() {
    const messagesContainer = document.getElementById('weatherMessages');
    if (!messagesContainer) return;
    
    const allPlots = getAllPlots();
    let recommendedPlot = null;
    let otherPlots = allPlots;
    
    // 如果有用户位置，计算最近的地块
    if (weatherAgentState.userLocation) {
        const userLat = weatherAgentState.userLocation.lat;
        const userLng = weatherAgentState.userLocation.lng;
        
        // 计算所有地块的距离
        const plotsWithDistance = allPlots.map(plot => ({
            ...plot,
            distance: calculateDistance(userLat, userLng, plot.lat, plot.lng)
        }));
        
        // 排序并获取最近的
        plotsWithDistance.sort((a, b) => a.distance - b.distance);
        recommendedPlot = plotsWithDistance[0];
        otherPlots = plotsWithDistance.slice(1);
    } else {
        // 没有位置信息时，默认推荐第一个地块
        recommendedPlot = allPlots[0];
        otherPlots = allPlots.slice(1);
    }
    
    // 构建选择器HTML
    const selectorDiv = document.createElement('div');
    selectorDiv.className = 'weather-message ai-message block-selector-container';
    
    let selectorHTML = `
        <div class="weather-message-avatar ai-avatar">
            <i class="fas fa-cloud-sun-rain"></i>
        </div>
        <div class="weather-message-content ai-content">
            <div class="block-selector">
                <div class="selector-header">请选择要查询的地块：</div>
    `;
    
    // 推荐地块
    if (recommendedPlot) {
        selectorHTML += `
            <div class="block-item recommended" onclick="handleBlockSelection('${recommendedPlot.id}')">
                <div class="block-primary">${recommendedPlot.baseName} - ${recommendedPlot.plotName}</div>
                <div class="block-secondary">${recommendedPlot.crop}</div>
                <div class="block-badge-corner">离我最近</div>
            </div>
        `;
    }
    
    // 其他地块（默认显示前5个）
    const initialShowCount = 5;
    const hasMore = otherPlots.length > initialShowCount;
    
    selectorHTML += '<div class="block-list">';
    otherPlots.forEach((plot, index) => {
        const hiddenClass = hasMore && index >= initialShowCount ? 'block-hidden' : '';
        selectorHTML += `
            <div class="block-item ${hiddenClass}" onclick="handleBlockSelection('${plot.id}')">
                <div class="block-primary">${plot.baseName} - ${plot.plotName}</div>
                <div class="block-secondary">${plot.crop}</div>
            </div>
        `;
    });
    selectorHTML += '</div>';
    
    // 查看更多按钮
    if (hasMore) {
        selectorHTML += `
            <button class="show-more-btn" onclick="toggleMoreBlocks(this)">
                <span class="show-more-text">查看更多</span>
                <i class="fas fa-chevron-down"></i>
            </button>
        `;
    }
    
    selectorHTML += `
            </div>
        </div>
    `;
    
    selectorDiv.innerHTML = selectorHTML;
    messagesContainer.appendChild(selectorDiv);
    
    // 滚动到底部
    const container = document.getElementById('weatherMessagesContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// 切换显示更多地块
function toggleMoreBlocks(button) {
    const selector = button.closest('.block-selector');
    const hiddenItems = selector.querySelectorAll('.block-hidden');
    const icon = button.querySelector('i');
    const text = button.querySelector('.show-more-text');
    
    if (hiddenItems[0].style.display === 'flex') {
        // 收起
        hiddenItems.forEach(item => item.style.display = 'none');
        icon.className = 'fas fa-chevron-down';
        text.textContent = '查看更多';
    } else {
        // 展开
        hiddenItems.forEach(item => item.style.display = 'flex');
        icon.className = 'fas fa-chevron-up';
        text.textContent = '收起';
    }
}

function showWeatherBriefing(lat, lng, plotInfo = null) {
    // 移除加载消息
    const loadingMsg = document.querySelector('.weather-message.loading');
    if (loadingMsg) loadingMsg.remove();
    
    // 显示地块气象轮播卡片，如果提供了地块信息则使用，否则使用默认值
    const briefingData = {
        location: plotInfo?.location || '柘城县',
        baseName: plotInfo?.baseName || '腾跃示范基地',
        crop: plotInfo?.crop || '辣椒',
        growthStage: plotInfo?.growthStage || '坐果期',
        trafficLight: 'suitable', // suitable, warning, forbidden
        currentWeather: {
            temp: '28°C',
            humidity: '65%',
            wind: '3级',
            condition: '多云'
        },
        alerts: [
            { type: 'rain', level: 'yellow', text: '暴雨黄色预警生效中' }
        ],
        relatedBases: [
            { name: '柘城县·示范田1号', crop: '玉米', stage: '抽穗期' },
            { name: '柘城县·示范田2号', crop: '小麦', stage: '灌浆期' }
        ]
    };
    
    addWeatherMessage('ai', '', 'briefing', null, briefingData);
    
    // 添加快捷追问气泡
    setTimeout(() => {
        const quickChips = [
            { text: '未来7天趋势？', action: 'quickQuestion', data: '未来7天趋势？' },
            { text: '最近有什么预警？', action: 'quickQuestion', data: '最近有什么预警？' },
            { text: '适合打药吗？', action: 'quickQuestion', data: '适合打药吗？' },
            { text: '柘城县历史灾害统计', action: 'quickQuestion', data: '柘城县历史灾害统计' }
        ];
        addWeatherMessage('ai', '您还可以问我：', 'text', quickChips);
    }, 500);
}

function sendWeatherMessage() {
    const input = document.getElementById('weatherInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 添加用户消息
    addWeatherMessage('user', message, 'text');
    input.value = '';
    
    // 处理用户意图并生成回复
    setTimeout(() => {
        handleWeatherQuery(message);
    }, 800);
}

function handleWeatherQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    // 意图识别
    if (lowerQuery.includes('预警') || lowerQuery.includes('大风') || lowerQuery.includes('下雨') || lowerQuery.includes('暴雨')) {
        // 查询预警
        showWeatherAlert(query);
    } else if (lowerQuery.includes('历史') || lowerQuery.includes('统计') || lowerQuery.includes('记录') || lowerQuery.includes('次数')) {
        // 查询历史统计
        showWeatherStatistics(query);
    } else if (lowerQuery.includes('趋势') || lowerQuery.includes('未来') || lowerQuery.includes('7天')) {
        // 查询未来趋势
        showWeatherTrend(query);
    } else if (lowerQuery.includes('打药') || lowerQuery.includes('农事') || lowerQuery.includes('作业')) {
        // 农事建议
        showFarmingAdvice(query);
    } else if (lowerQuery.includes('郑州') || lowerQuery.includes('其他区域')) {
        // 跨区域查询
        showCrossRegionQuery(query);
    } else {
        // 通用回复
        addWeatherMessage('ai', `关于"${query}"，我正在为您查询相关信息...`, 'text');
    }
}

function showWeatherAlert(query) {
    const alertData = {
        location: '柘城县',
        alerts: [
            {
                type: 'wind',
                level: 'blue',
                title: '大风蓝色预警',
                time: '今日 10:00',
                content: '柘城县气象台今日10:00发布大风蓝色预警，预计下午风力可达7级，请注意防范。',
                defense: [
                    '加固大棚设施',
                    '避免高空作业',
                    '注意用火安全'
                ]
            }
        ]
    };
    
    addWeatherMessage('ai', '', 'alert', null, alertData);
}

function showWeatherStatistics(query) {
    const statsData = {
        location: '柘城县',
        period: '过去30天',
        summary: '过去30天，您所在的柘城县共发布预警 5 次，主要集中在 大风 天气。',
        charts: {
            pie: {
                title: '灾害类型占比',
                data: [
                    { name: '大风', value: 40, color: '#FF6B6B' },
                    { name: '暴雨', value: 30, color: '#4ECDC4' },
                    { name: '冰雹', value: 20, color: '#95E1D3' },
                    { name: '其他', value: 10, color: '#F38181' }
                ]
            },
            bar: {
                title: '每月预警次数趋势',
                data: [
                    { month: '1月', count: 2 },
                    { month: '2月', count: 1 },
                    { month: '3月', count: 2 }
                ]
            }
        },
        historyList: [
            { date: '2024-03-15', type: '大风', level: '蓝色', content: '预计下午风力可达7级' },
            { date: '2024-03-10', type: '暴雨', level: '黄色', content: '预计未来6小时降雨量达50mm' },
            { date: '2024-03-05', type: '大风', level: '蓝色', content: '预计下午风力可达6级' }
        ]
    };
    
    addWeatherMessage('ai', '', 'statistics', null, statsData);
}

function showWeatherTrend(query) {
    const trendData = {
        location: '柘城县',
        days: 7,
        forecast: [
            { date: '今天', temp: '28°C', condition: '多云', wind: '3级' },
            { date: '明天', temp: '26°C', condition: '小雨', wind: '4级' },
            { date: '后天', temp: '24°C', condition: '中雨', wind: '5级' },
            { date: '第4天', temp: '25°C', condition: '阴', wind: '3级' },
            { date: '第5天', temp: '27°C', condition: '晴', wind: '2级' },
            { date: '第6天', temp: '29°C', condition: '晴', wind: '2级' },
            { date: '第7天', temp: '30°C', condition: '多云', wind: '3级' }
        ],
        advice: '未来7天，柘城县以多云和小雨天气为主，建议关注第2-3天的降雨天气，合理安排农事活动。'
    };
    
    addWeatherMessage('ai', '', 'trend', null, trendData);
}

function showFarmingAdvice(query) {
    const adviceData = {
        location: '柘城县',
        crop: '辣椒',
        stage: '坐果期',
        currentWeather: {
            temp: '28°C',
            humidity: '65%',
            wind: '3级'
        },
        suitable: true,
        advice: '当前天气条件适宜进行打药作业。温度适中，风力较小，建议在上午9-11点或下午4-6点进行，避开高温时段。',
        windows: [
            { time: '今天 09:00-11:00', suitable: true, reason: '温度适宜，无风' },
            { time: '今天 16:00-18:00', suitable: true, reason: '温度下降，风力小' },
            { time: '明天 09:00-11:00', suitable: false, reason: '预计有雨' }
        ]
    };
    
    addWeatherMessage('ai', '', 'farming-advice', null, adviceData);
}

function showCrossRegionQuery(query) {
    let location = '柘城县';
    if (query.includes('郑州')) location = '郑州市';
    
    addWeatherMessage('ai', `正在为您查询${location}的预警信息...`, 'text');
    
    setTimeout(() => {
        const crossRegionData = {
            location: location,
            alerts: [
                {
                    type: 'rain',
                    level: 'orange',
                    title: '暴雨橙色预警',
                    time: '今日 14:00',
                    content: `${location}气象台今日14:00发布暴雨橙色预警，预计未来6小时降雨量达100mm以上，请注意防范。`
                }
            ],
            currentWeather: {
                temp: location === '郑州市' ? '22°C' : '28°C',
                condition: location === '郑州市' ? '暴雨' : '多云'
            }
        };
        
        addWeatherMessage('ai', '', 'cross-region', null, crossRegionData);
    }, 1000);
}

function addWeatherMessage(type, content, messageType = 'text', chips = null, data = null) {
    const messagesContainer = document.getElementById('weatherMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `weather-message ${type}-message ${messageType}`;
    
    if (type === 'user') {
        messageDiv.innerHTML = `
            <div class="weather-message-content user-content">
                <div class="weather-message-bubble">${content}</div>
            </div>
            <div class="weather-message-avatar user-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
    } else {
        if (messageType === 'loading') {
            messageDiv.innerHTML = `
                <div class="weather-message-avatar ai-avatar">
                    <i class="fas fa-cloud-sun-rain"></i>
                </div>
                <div class="weather-message-content ai-content">
                    <div class="weather-loading">
                        <div class="loading-dots">
                            <span></span><span></span><span></span>
                        </div>
                        <div class="loading-text">正在定位并分析地块气象...</div>
                    </div>
                </div>
            `;
        } else if (messageType === 'briefing' && data) {
            messageDiv.innerHTML = generateBriefingCard(data);
        } else if (messageType === 'alert' && data) {
            messageDiv.innerHTML = generateAlertCard(data);
        } else if (messageType === 'statistics' && data) {
            messageDiv.innerHTML = generateStatisticsCard(data);
        } else if (messageType === 'trend' && data) {
            messageDiv.innerHTML = generateTrendCard(data);
        } else if (messageType === 'farming-advice' && data) {
            messageDiv.innerHTML = generateFarmingAdviceCard(data);
        } else if (messageType === 'cross-region' && data) {
            messageDiv.innerHTML = generateCrossRegionCard(data);
        } else {
            let chipsHtml = '';
            if (chips && chips.length > 0) {
                chipsHtml = '<div class="weather-chips">' + 
                    chips.map(chip => 
                        `<div class="weather-chip" onclick="handleWeatherChip('${chip.action}', '${chip.data || ''}')">${chip.text}</div>`
                    ).join('') + 
                    '</div>';
            }
            
            messageDiv.innerHTML = `
                <div class="weather-message-avatar ai-avatar">
                    <i class="fas fa-cloud-sun-rain"></i>
                </div>
                <div class="weather-message-content ai-content">
                    <div class="weather-message-bubble">${content}</div>
                    ${chipsHtml}
                    <div class="weather-message-actions">
                        <button class="action-btn" onclick="copyWeatherMessage(this)" title="复制">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn" onclick="likeWeatherMessage(this)" title="赞">
                            <i class="far fa-thumbs-up"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // 滚动到底部
    const container = document.getElementById('weatherMessagesContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

function generateBriefingCard(data) {
    const trafficLightIcon = data.trafficLight === 'suitable' ? '🟢' : 
                            data.trafficLight === 'warning' ? '🟡' : '🔴';
    const trafficLightText = data.trafficLight === 'suitable' ? '适宜' : 
                            data.trafficLight === 'warning' ? '注意' : '禁止';
    const trafficLightClass = data.trafficLight;
    
    const alertHtml = data.alerts.map(alert => 
        `<div class="briefing-alert ${alert.level}">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${alert.text}</span>
        </div>`
    ).join('');
    
    const relatedBasesHtml = data.relatedBases && data.relatedBases.length > 0 ? 
        `<div class="related-bases">
            <div class="related-bases-title">关联地块</div>
            <div class="related-bases-list">
                ${data.relatedBases.map(base => 
                    `<div class="related-base-item">
                        <div class="base-name">${base.name}</div>
                        <div class="base-info">${base.crop} · ${base.stage}</div>
                    </div>`
                ).join('')}
            </div>
        </div>` : '';
    
    return `
        <div class="weather-message-avatar ai-avatar">
            <i class="fas fa-cloud-sun-rain"></i>
        </div>
        <div class="weather-message-content ai-content">
            <div class="weather-briefing-card">
                <div class="briefing-header">
                    <div class="traffic-light ${trafficLightClass}">
                        <div class="traffic-light-icon">${trafficLightIcon}</div>
                        <div class="traffic-light-text">${trafficLightText}</div>
                    </div>
                    <div class="briefing-title">
                        <div class="briefing-location">${data.location} · ${data.baseName}</div>
                        <div class="briefing-crop">${data.crop} · ${data.growthStage}</div>
                    </div>
                </div>
                <div class="briefing-weather">
                    <div class="weather-item">
                        <i class="fas fa-thermometer-half"></i>
                        <span>${data.currentWeather.temp}</span>
                    </div>
                    <div class="weather-item">
                        <i class="fas fa-tint"></i>
                        <span>${data.currentWeather.humidity}</span>
                    </div>
                    <div class="weather-item">
                        <i class="fas fa-wind"></i>
                        <span>${data.currentWeather.wind}</span>
                    </div>
                    <div class="weather-item">
                        <i class="fas fa-cloud"></i>
                        <span>${data.currentWeather.condition}</span>
                    </div>
                </div>
                ${alertHtml ? `<div class="briefing-alerts">${alertHtml}</div>` : ''}
                ${relatedBasesHtml}
                <button class="briefing-detail-btn" onclick='showWeatherDetailPage(${JSON.stringify(data)})'>
                    <i class="fas fa-chevron-right"></i>
                    <span>地块气象灾害预报</span>
                </button>
            </div>
        </div>
    `;
}

function generateAlertCard(data) {
    const alertHtml = data.alerts.map(alert => {
        const levelClass = alert.level;
        const levelText = alert.level === 'red' ? '红色' : 
                         alert.level === 'orange' ? '橙色' : 
                         alert.level === 'yellow' ? '黄色' : '蓝色';
        
        const defenseHtml = alert.defense ? 
            `<div class="alert-defense">
                <div class="defense-title">防御指南：</div>
                <ul class="defense-list">
                    ${alert.defense.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>` : '';
        
        return `
            <div class="weather-alert-card ${levelClass}">
                <div class="alert-header">
                    <div class="alert-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-info">
                        <div class="alert-title">${alert.title}</div>
                        <div class="alert-time">${alert.time}</div>
                    </div>
                    <div class="alert-level">${levelText}</div>
                </div>
                <div class="alert-content">${alert.content}</div>
                ${defenseHtml}
            </div>
        `;
    }).join('');
    
    return `
        <div class="weather-message-avatar ai-avatar">
            <i class="fas fa-cloud-sun-rain"></i>
        </div>
        <div class="weather-message-content ai-content">
            <div class="weather-alerts-container">
                ${alertHtml}
            </div>
        </div>
    `;
}

function generateStatisticsCard(data) {
    // 生成饼图HTML（使用CSS模拟）
    const pieHtml = `
        <div class="statistics-pie-chart">
            <div class="pie-title">${data.charts.pie.title}</div>
            <div class="pie-container">
                ${data.charts.pie.data.map((item, index) => {
                    const angle = (item.value / 100) * 360;
                    return `
                        <div class="pie-segment" style="--angle: ${angle}deg; --color: ${item.color}; --index: ${index}">
                            <div class="pie-label">${item.name} ${item.value}%</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // 生成柱状图HTML
    const barHtml = `
        <div class="statistics-bar-chart">
            <div class="bar-title">${data.charts.bar.title}</div>
            <div class="bar-container">
                ${data.charts.bar.data.map(item => {
                    const maxCount = Math.max(...data.charts.bar.data.map(d => d.count));
                    const height = (item.count / maxCount) * 100;
                    return `
                        <div class="bar-item">
                            <div class="bar-value">${item.count}</div>
                            <div class="bar-column" style="height: ${height}%"></div>
                            <div class="bar-label">${item.month}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    const historyListHtml = `
        <div class="history-list">
            ${data.historyList.map(item => `
                <div class="history-item">
                    <div class="history-date">${item.date}</div>
                    <div class="history-info">
                        <span class="history-type">${item.type}</span>
                        <span class="history-level ${item.level}">${item.level}</span>
                    </div>
                    <div class="history-content">${item.content}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    return `
        <div class="weather-message-avatar ai-avatar">
            <i class="fas fa-cloud-sun-rain"></i>
        </div>
        <div class="weather-message-content ai-content">
            <div class="weather-statistics-card">
                <div class="statistics-summary">${data.summary}</div>
                ${pieHtml}
                ${barHtml}
                <button class="statistics-detail-btn" onclick="showHistoryList()">
                    <i class="fas fa-list"></i>
                    <span>查看详细列表</span>
                </button>
                <div class="history-list-modal" id="historyListModal" style="display: none;">
                    <div class="modal-overlay" onclick="closeHistoryList()"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>历史预警列表</h3>
                            <button class="close-btn" onclick="closeHistoryList()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            ${historyListHtml}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateTrendCard(data) {
    const forecastHtml = data.forecast.map(day => `
        <div class="trend-day">
            <div class="day-date">${day.date}</div>
            <div class="day-weather">
                <i class="fas fa-${day.condition === '晴' ? 'sun' : day.condition === '多云' ? 'cloud' : 'cloud-rain'}"></i>
            </div>
            <div class="day-temp">${day.temp}</div>
            <div class="day-wind">${day.wind}</div>
        </div>
    `).join('');
    
    return `
        <div class="weather-message-avatar ai-avatar">
            <i class="fas fa-cloud-sun-rain"></i>
        </div>
        <div class="weather-message-content ai-content">
            <div class="weather-trend-card">
                <div class="trend-title">${data.location}未来${data.days}天天气预报</div>
                <div class="trend-forecast">${forecastHtml}</div>
                <div class="trend-advice">${data.advice}</div>
            </div>
        </div>
    `;
}

function generateFarmingAdviceCard(data) {
    const windowsHtml = data.windows.map(window => `
        <div class="advice-window ${window.suitable ? 'suitable' : 'unsuitable'}">
            <div class="window-time">${window.time}</div>
            <div class="window-status">
                <i class="fas fa-${window.suitable ? 'check-circle' : 'times-circle'}"></i>
                <span>${window.suitable ? '适宜' : '不适宜'}</span>
            </div>
            <div class="window-reason">${window.reason}</div>
        </div>
    `).join('');
    
    return `
        <div class="weather-message-avatar ai-avatar">
            <i class="fas fa-cloud-sun-rain"></i>
        </div>
        <div class="weather-message-content ai-content">
            <div class="weather-farming-advice-card">
                <div class="advice-header">
                    <div class="advice-crop">${data.crop} · ${data.stage}</div>
                    <div class="advice-location">${data.location}</div>
                </div>
                <div class="advice-status ${data.suitable ? 'suitable' : 'unsuitable'}">
                    <i class="fas fa-${data.suitable ? 'check-circle' : 'times-circle'}"></i>
                    <span>${data.suitable ? '当前天气条件适宜进行打药作业' : '当前天气条件不适宜进行打药作业'}</span>
                </div>
                <div class="advice-content">${data.advice}</div>
                <div class="advice-windows">
                    <div class="windows-title">24小时作业窗口</div>
                    ${windowsHtml}
                </div>
            </div>
        </div>
    `;
}

function generateCrossRegionCard(data) {
    const alertHtml = data.alerts.map(alert => {
        const levelClass = alert.level;
        return `
            <div class="cross-region-alert ${levelClass}">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-time">${alert.time}</div>
                <div class="alert-content">${alert.content}</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="weather-message-avatar ai-avatar">
            <i class="fas fa-cloud-sun-rain"></i>
        </div>
        <div class="weather-message-content ai-content">
            <div class="weather-cross-region-card">
                <div class="cross-region-location">${data.location}</div>
                <div class="cross-region-weather">
                    <div class="weather-temp">${data.currentWeather.temp}</div>
                    <div class="weather-condition">${data.currentWeather.condition}</div>
                </div>
                ${alertHtml}
            </div>
        </div>
    `;
}

function handleWeatherChip(action, data) {
    if (action === 'requestLocation') {
        requestLocationPermission();
    } else if (action === 'selectLocation') {
        showLocationSelector();
    } else if (action === 'selectPlot') {
        // 用户选择了具体地块，显示对应的气象简报
        handlePlotSelection(data);
    } else if (action === 'quickQuestion') {
        document.getElementById('weatherInput').value = data;
        sendWeatherMessage();
    }
}

// 处理地块选择
function handleBlockSelection(plotId) {
    // 移除地块选择器
    const selectorContainer = document.querySelector('.block-selector-container');
    if (selectorContainer) selectorContainer.remove();
    
    // 获取选中的地块信息
    const allPlots = getAllPlots();
    const selectedPlot = allPlots.find(p => p.id === plotId);
    
    if (!selectedPlot) return;
    
    // 显示用户选择消息
    addWeatherMessage('user', `${selectedPlot.baseName} - ${selectedPlot.plotName}`, 'text');
    
    // 显示加载状态
    setTimeout(() => {
        const messagesContainer = document.getElementById('weatherMessages');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'weather-message ai-message loading-message';
        loadingDiv.innerHTML = `
            <div class="weather-message-avatar ai-avatar">
                <i class="fas fa-cloud-sun-rain"></i>
            </div>
            <div class="weather-message-content ai-content">
                <div class="weather-loading">
                    <div class="loading-dots">
                        <span></span><span></span><span></span>
                    </div>
                    <div class="loading-text">正在为您生成 ${selectedPlot.plotName} 的报告，请稍候...</div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(loadingDiv);
        
        // 滚动到底部
        const container = document.getElementById('weatherMessagesContainer');
        container.scrollTop = container.scrollHeight;
        
        // 模拟生成报告（1.5秒）
        setTimeout(() => {
            // 移除加载消息
            loadingDiv.remove();
            
            // 生成报告数据
            const reportData = generateWeatherReport(selectedPlot);
            
            // 保存到状态
            weatherAgentState.lastGeneratedReport = reportData;
            
            // 显示预览卡片
            showWeatherResultPreview(reportData);
            
            // 再次显示生成按钮
            setTimeout(() => {
                showGenerateReportButton();
            }, 300);
        }, 1500);
    }, 500);
}

// 生成气象报告数据
function generateWeatherReport(plot) {
    const now = new Date();
    
    // 随机生成预警等级
    const warningLevels = ['blue', 'yellow', 'orange', 'red'];
    const warningTexts = {
        'blue': '蓝色预警',
        'yellow': '黄色预警',
        'orange': '橙色预警',
        'red': '红色预警'
    };
    const randomLevel = warningLevels[Math.floor(Math.random() * warningLevels.length)];
    
    // 生成简要分析
    const analyses = [
        `未来3天${plot.location}地区将有中到大雨，${plot.crop}处于${plot.growthStage}，需注意田间排水，防止积水导致根系缺氧。`,
        `近期气温适宜，湿度偏高，适合${plot.crop}生长，但需警惕病虫害发生，建议加强田间监测。`,
        `未来一周天气晴好，温度逐渐升高，${plot.crop}${plot.growthStage}需水量较大，建议及时灌溉。`
    ];
    const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
    
    return {
        id: `report_${Date.now()}`,
        plot: plot,
        timestamp: now,
        warningLevel: randomLevel,
        warningText: warningTexts[randomLevel],
        briefAnalysis: randomAnalysis,
        weather: {
            temp: `${22 + Math.floor(Math.random() * 10)}°C`,
            humidity: `${55 + Math.floor(Math.random() * 20)}%`,
            wind: `${2 + Math.floor(Math.random() * 3)}级`,
            condition: ['晴', '多云', '阴', '小雨'][Math.floor(Math.random() * 4)]
        }
    };
}

// 显示气象结果预览卡片
function showWeatherResultPreview(reportData) {
    const messagesContainer = document.getElementById('weatherMessages');
    if (!messagesContainer) return;
    
    const plot = reportData.plot;
    const warningLevel = reportData.warningLevel;
    
    // 预警等级图标和文字
    const warningConfig = {
        'red': { icon: '🔴', text: '红色预警', iconClass: 'fas fa-exclamation-circle' },
        'orange': { icon: '🟠', text: '橙色预警', iconClass: 'fas fa-exclamation-triangle' },
        'yellow': { icon: '🟡', text: '黄色预警', iconClass: 'fas fa-exclamation' },
        'blue': { icon: '🔵', text: '蓝色预警', iconClass: 'fas fa-info-circle' }
    };
    
    const warning = warningConfig[warningLevel] || warningConfig['blue'];
    
    // 格式化时间
    const timeStr = formatTimestamp(reportData.timestamp);
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'weather-message ai-message result-preview-container';
    cardDiv.innerHTML = `
        <div class="weather-message-time">${timeStr}</div>
        <div class="weather-result-card-wrapper" onclick='showWeatherDetailPage(${JSON.stringify(reportData)})'>
            <div class="weather-result-card-new">
                <div class="result-card-header">
                    <div class="result-card-icon">
                        <i class="fas fa-cloud-sun-rain"></i>
                    </div>
                    <div class="result-card-info">
                        <div class="result-card-title">${plot.baseName} - ${plot.plotName}</div>
                        <div class="result-card-meta">
                            <span class="result-crop-tag">${plot.crop}</span>
                            <span class="result-stage-tag">${plot.growthStage || ''}</span>
                        </div>
                    </div>
                    <div class="result-warning-badge ${warningLevel}">
                        <i class="${warning.iconClass}"></i>
                    </div>
                </div>
                
                <div class="result-card-content">
                    <div class="result-warning-info ${warningLevel}">
                        <div class="warning-level-text">${warning.text}</div>
                    </div>
                    <div class="result-analysis-text">
                        ${reportData.briefAnalysis}
                    </div>
                </div>
                
                <div class="result-card-footer">
                    <span class="footer-text">查看完整报告</span>
                    <i class="fas fa-chevron-right footer-arrow"></i>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(cardDiv);
    
    // 滚动到底部
    const container = document.getElementById('weatherMessagesContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// 格式化时间戳
function formatTimestamp(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return '刚刚';
    } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        const hours = date.getHours();
        const mins = date.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
        return '昨天';
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
    }
}

// 兼容旧的函数
function handlePlotSelection(plotId) {
    handleBlockSelection(plotId);
}

function showWeatherDetail() {
    showNotification('气象决策详情页开发中...', 'info');
}

// 全局变量存储当前气象详情数据
let currentWeatherDetailData = null;

function showWeatherDetailPage(data) {
    // 兼容新旧数据格式
    let detailData;
    
    if (data.plot) {
        // 新格式：从 reportData 转换
        const plot = data.plot;
        detailData = {
            location: plot.location || '柘城县',
            baseName: plot.baseName,
            crop: plot.crop,
            growthStage: plot.growthStage,
            trafficLight: data.warningLevel === 'red' ? 'forbidden' : 
                         data.warningLevel === 'orange' ? 'warning' : 'suitable',
            currentWeather: data.weather || {
                temp: '28°C',
                humidity: '65%',
                wind: '3级',
                condition: '多云'
            },
            alerts: data.warningLevel !== 'blue' ? [{
                type: 'weather',
                level: data.warningLevel,
                text: data.warningText || data.briefAnalysis
            }] : [],
            relatedBases: []
        };
    } else {
        // 旧格式：直接使用
        detailData = data;
    }
    
    // 存储当前数据
    currentWeatherDetailData = detailData;
    
    // 加载气象详情页面
    loadPage('weatherDetail');
    
    // 页面加载后填充内容
    setTimeout(() => {
        renderWeatherDetailContent(detailData);
    }, 100);
}

// 生成地块详细报告数据（包含详细的农业场景分析）
function generateFieldDetailData() {
    return {
        // 历史灾害持续影响
        historicalImpact: {
            lastDisaster: {
                type: '干旱',
                date: '2024-10-15',
                duration: '12天前',
                icon: '☀️'
            },
            currentEffects: [
                {
                    factor: '土壤墒情',
                    status: 'insufficient',
                    value: '45%',
                    normal: '60-80%',
                    description: '上次干旱导致土壤持续缺水，当前墒情不足',
                    suggestion: '建议在本次降雨前抢墒灌溉，补充土壤水分'
                },
                {
                    factor: '作物长势',
                    status: 'weak',
                    value: '弱',
                    description: '干旱期间作物生长缓慢，根系发育受限',
                    suggestion: '降雨后及时追肥，促进作物恢复生长'
                }
            ]
        },
        // 作物生长阶段关联分析
        cropGrowthAnalysis: [
            {
                crop: '辣椒',
                stage: '结果期',
                stageIcon: '🌶️',
                criticalDays: 15,
                riskFactors: [
                    {
                        type: '暴雨积水',
                        impact: '高',
                        description: '结果期遇积水易导致落花落果，病害高发'
                    },
                    {
                        type: '后续高温',
                        impact: '中',
                        description: '若3天内转晴高温，果实易发生日灼病'
                    }
                ],
                measures: '立即清沟排水，预防性喷施杀菌剂，高温天搭建遮阳网'
            }
        ],
        // 农业关键指标
        agriIndicators: {
            soilMoisture: {
                name: '墒情监测',
                icon: '💧',
                status: 'low',
                statusText: '偏低',
                value: '45%',
                range: '正常60-80%',
                trend: 'improving',
                trendText: '预计改善',
                description: '当前土壤墒情不足，本次降雨后将有效改善',
                warning: '降雨强度大，注意避免由旱转涝'
            },
            pestMonitoring: {
                name: '虫情监测',
                icon: '🐛',
                status: 'medium',
                statusText: '中等',
                pests: [
                    { name: '玉米螟', level: 'medium', count: '15头/百株' },
                    { name: '蚜虫', level: 'low', count: '200头/百株' }
                ],
                forecast: '降雨后田间湿度增大，需防范夜蛾类害虫爆发',
                suggestion: '雨后及时施药防治，选用高效低毒农药'
            },
            cropCondition: {
                name: '苗情监测',
                icon: '🌱',
                status: 'good',
                statusText: '总体较好',
                metrics: [
                    { name: '一类苗', percent: 45, color: '#52c41a' },
                    { name: '二类苗', percent: 40, color: '#faad14' },
                    { name: '三类苗', percent: 15, color: '#ff4d4f' }
                ],
                description: '大部分作物长势正常，少部分受前期干旱影响生长偏弱',
                suggestion: '雨后对弱苗及时追施速效肥，促进转化升级'
            },
            diseaseMonitoring: {
                name: '病害监测',
                icon: '🦠',
                status: 'high',
                statusText: '风险较高',
                diseases: [
                    { name: '辣椒疫病', risk: 'high', reason: '高温高湿环境利于病菌传播' },
                    { name: '玉米锈病', risk: 'medium', reason: '连阴雨天气易诱发' }
                ],
                forecast: '降雨后田间湿度大，病害发生风险显著增加',
                suggestion: '提前预防性用药，选用保护性+治疗性杀菌剂复配'
            }
        },
        // 未来7天风险预测
        futureRisks: {
            timeline: [
                {
                    date: '今天',
                    dateStr: '10-27',
                    weather: '暴雨',
                    icon: '🌧️',
                    temp: '22-26℃',
                    risks: ['积水风险', '病害传播'],
                    riskLevel: 'high'
                },
                {
                    date: '明天',
                    dateStr: '10-28',
                    weather: '阴转多云',
                    icon: '⛅',
                    temp: '20-28℃',
                    risks: ['高湿环境', '病害高发期'],
                    riskLevel: 'high'
                },
                {
                    date: '后天',
                    dateStr: '10-29',
                    weather: '晴',
                    icon: '☀️',
                    temp: '18-30℃',
                    risks: ['快速升温', '作物应激'],
                    riskLevel: 'medium'
                },
                {
                    date: '第4天',
                    dateStr: '10-30',
                    weather: '晴转多云',
                    icon: '🌤️',
                    temp: '20-32℃',
                    risks: ['高温风险', '蒸腾过旺'],
                    riskLevel: 'medium'
                },
                {
                    date: '第5-7天',
                    dateStr: '10-31至11-02',
                    weather: '多云',
                    icon: '☁️',
                    temp: '18-28℃',
                    risks: ['天气平稳', '适宜田管'],
                    riskLevel: 'low'
                }
            ],
            keyAlert: '特别关注：降雨后转晴，2-3天内是病虫害防治关键期！'
        }
    };
}

function renderWeatherDetailContent(data) {
    const container = document.getElementById('weatherDetailContent');
    if (!container) return;
    
    // 获取详细数据
    const detailData = generateFieldDetailData();
    
    const trafficLightIcon = data.trafficLight === 'suitable' ? '🟢' : 
                            data.trafficLight === 'warning' ? '🟡' : '🔴';
    const trafficLightText = data.trafficLight === 'suitable' ? '适宜农事作业' : 
                            data.trafficLight === 'warning' ? '谨慎作业' : '禁止作业';
    const trafficLightClass = data.trafficLight;
    
    const alertsHtml = data.alerts && data.alerts.length > 0 ? 
        `<div class="detail-section">
            <div class="section-title"><i class="fas fa-exclamation-triangle"></i> 预警信息</div>
            ${data.alerts.map(alert => 
                `<div class="alert-card ${alert.level}">
                    <div class="alert-badge">${alert.level === 'yellow' ? '黄色预警' : '蓝色预警'}</div>
                    <div class="alert-text">${alert.text}</div>
                </div>`
            ).join('')}
        </div>` : '';
    
    const relatedBasesHtml = data.relatedBases && data.relatedBases.length > 0 ? 
        `<div class="detail-section">
            <div class="section-title"><i class="fas fa-map-marker-alt"></i> 关联地块</div>
            <div class="related-plots-grid">
                ${data.relatedBases.map(base => 
                    `<div class="plot-card">
                        <div class="plot-name">${base.name}</div>
                        <div class="plot-info">${base.crop} · ${base.stage}</div>
                    </div>`
                ).join('')}
            </div>
        </div>` : '';
    
    container.innerHTML = `
        <div class="detail-header-card">
            <div class="detail-traffic-light ${trafficLightClass}">
                <div class="traffic-icon">${trafficLightIcon}</div>
                <div class="traffic-text">${trafficLightText}</div>
            </div>
            <div class="detail-location">
                <h2>${data.location} · ${data.baseName}</h2>
                <p>${data.crop} · ${data.growthStage}</p>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="section-title"><i class="fas fa-cloud-sun"></i> 当前天气</div>
            <div class="weather-grid">
                <div class="weather-grid-item">
                    <i class="fas fa-thermometer-half"></i>
                    <div class="weather-label">温度</div>
                    <div class="weather-value">${data.currentWeather.temp}</div>
                </div>
                <div class="weather-grid-item">
                    <i class="fas fa-tint"></i>
                    <div class="weather-label">湿度</div>
                    <div class="weather-value">${data.currentWeather.humidity}</div>
                </div>
                <div class="weather-grid-item">
                    <i class="fas fa-wind"></i>
                    <div class="weather-label">风力</div>
                    <div class="weather-value">${data.currentWeather.wind}</div>
                </div>
                <div class="weather-grid-item">
                    <i class="fas fa-cloud"></i>
                    <div class="weather-label">天气</div>
                    <div class="weather-value">${data.currentWeather.condition}</div>
                </div>
            </div>
        </div>
        
        ${alertsHtml}
        ${relatedBasesHtml}
        
        <!-- 历史灾害持续影响 -->
        <div class="detail-section">
            <div class="section-title"><i class="fas fa-history"></i> 历史灾害持续影响</div>
            <div class="historical-impact-card">
                <div class="impact-header">
                    <span class="impact-icon">${detailData.historicalImpact.lastDisaster.icon}</span>
                    <div class="impact-info">
                        <div class="impact-title">${detailData.historicalImpact.lastDisaster.type}</div>
                        <div class="impact-date">${detailData.historicalImpact.lastDisaster.date}（${detailData.historicalImpact.lastDisaster.duration}）</div>
                    </div>
                </div>
                <div class="impact-effects">
                    ${detailData.historicalImpact.currentEffects.map(effect => `
                        <div class="effect-item ${effect.status}">
                            <div class="effect-header">
                                <span class="effect-factor">${effect.factor}</span>
                                <span class="effect-value">${effect.value}</span>
                            </div>
                            <div class="effect-normal">正常范围：${effect.normal}</div>
                            <div class="effect-desc">${effect.description}</div>
                            <div class="effect-suggestion">
                                <i class="fas fa-lightbulb"></i>
                                ${effect.suggestion}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <!-- 作物生长阶段关联分析 -->
        <div class="detail-section">
            <div class="section-title"><i class="fas fa-leaf"></i> 作物生长阶段关联分析</div>
            ${detailData.cropGrowthAnalysis.map(crop => `
                <div class="growth-stage-card">
                    <div class="stage-header">
                        <div class="stage-crop">
                            <span class="crop-icon">${crop.stageIcon}</span>
                            <span class="crop-name">${crop.crop}</span>
                        </div>
                        <div class="stage-info">
                            <span class="stage-name">${crop.stage}</span>
                            <span class="critical-period">关键期${crop.criticalDays}天</span>
                        </div>
                    </div>
                    <div class="risk-factors">
                        ${crop.riskFactors.map(risk => `
                            <div class="risk-factor-item">
                                <div class="risk-header">
                                    <span class="risk-type">${risk.type}</span>
                                    <span class="risk-impact impact-${risk.impact === '高' ? 'high' : risk.impact === '中' ? 'medium' : 'low'}">
                                        ${risk.impact}影响
                                    </span>
                                </div>
                                <div class="risk-desc">${risk.description}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="growth-measures">
                        <i class="fas fa-tools"></i>
                        <span>${crop.measures}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <!-- 农业关键指标 -->
        <div class="detail-section">
            <div class="section-title"><i class="fas fa-chart-line"></i> 农业关键指标监测</div>
            <div class="indicators-grid">
                <!-- 墒情监测 -->
                <div class="indicator-card soil-moisture ${detailData.agriIndicators.soilMoisture.status}">
                    <div class="indicator-header">
                        <span class="indicator-icon">${detailData.agriIndicators.soilMoisture.icon}</span>
                        <span class="indicator-name">${detailData.agriIndicators.soilMoisture.name}</span>
                        <span class="indicator-status">${detailData.agriIndicators.soilMoisture.statusText}</span>
                    </div>
                    <div class="indicator-value-row">
                        <div class="value-item">
                            <span class="value-label">当前</span>
                            <span class="value-number">${detailData.agriIndicators.soilMoisture.value}</span>
                        </div>
                        <div class="value-item">
                            <span class="value-label">${detailData.agriIndicators.soilMoisture.range}</span>
                        </div>
                    </div>
                    <div class="indicator-trend ${detailData.agriIndicators.soilMoisture.trend}">
                        <i class="fas fa-arrow-up"></i>
                        ${detailData.agriIndicators.soilMoisture.trendText}
                    </div>
                    <div class="indicator-desc">${detailData.agriIndicators.soilMoisture.description}</div>
                    <div class="indicator-warning">
                        <i class="fas fa-exclamation-circle"></i>
                        ${detailData.agriIndicators.soilMoisture.warning}
                    </div>
                </div>
                
                <!-- 虫情监测 -->
                <div class="indicator-card pest-monitoring ${detailData.agriIndicators.pestMonitoring.status}">
                    <div class="indicator-header">
                        <span class="indicator-icon">${detailData.agriIndicators.pestMonitoring.icon}</span>
                        <span class="indicator-name">${detailData.agriIndicators.pestMonitoring.name}</span>
                        <span class="indicator-status">${detailData.agriIndicators.pestMonitoring.statusText}</span>
                    </div>
                    <div class="pest-list">
                        ${detailData.agriIndicators.pestMonitoring.pests.map(pest => `
                            <div class="pest-item">
                                <div class="pest-info">
                                    <span class="pest-name">${pest.name}</span>
                                    <span class="pest-level level-${pest.level}">${pest.level === 'high' ? '高' : pest.level === 'medium' ? '中' : '低'}发</span>
                                </div>
                                <div class="pest-count">${pest.count}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="indicator-forecast">${detailData.agriIndicators.pestMonitoring.forecast}</div>
                    <div class="indicator-suggestion">
                        <i class="fas fa-lightbulb"></i>
                        ${detailData.agriIndicators.pestMonitoring.suggestion}
                    </div>
                </div>
                
                <!-- 苗情监测 -->
                <div class="indicator-card crop-condition ${detailData.agriIndicators.cropCondition.status}">
                    <div class="indicator-header">
                        <span class="indicator-icon">${detailData.agriIndicators.cropCondition.icon}</span>
                        <span class="indicator-name">${detailData.agriIndicators.cropCondition.name}</span>
                        <span class="indicator-status">${detailData.agriIndicators.cropCondition.statusText}</span>
                    </div>
                    <div class="crop-metrics">
                        ${detailData.agriIndicators.cropCondition.metrics.map(metric => `
                            <div class="metric-item">
                                <div class="metric-bar" style="width: ${metric.percent}%; background: ${metric.color};"></div>
                                <div class="metric-label">${metric.name} ${metric.percent}%</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="indicator-desc">${detailData.agriIndicators.cropCondition.description}</div>
                    <div class="indicator-suggestion">
                        <i class="fas fa-lightbulb"></i>
                        ${detailData.agriIndicators.cropCondition.suggestion}
                    </div>
                </div>
                
                <!-- 病害监测 -->
                <div class="indicator-card disease-monitoring ${detailData.agriIndicators.diseaseMonitoring.status}">
                    <div class="indicator-header">
                        <span class="indicator-icon">${detailData.agriIndicators.diseaseMonitoring.icon}</span>
                        <span class="indicator-name">${detailData.agriIndicators.diseaseMonitoring.name}</span>
                        <span class="indicator-status">${detailData.agriIndicators.diseaseMonitoring.statusText}</span>
                    </div>
                    <div class="disease-list">
                        ${detailData.agriIndicators.diseaseMonitoring.diseases.map(disease => `
                            <div class="disease-item">
                                <div class="disease-info">
                                    <span class="disease-name">${disease.name}</span>
                                    <span class="disease-risk risk-${disease.risk}">
                                        ${disease.risk === 'high' ? '🔴 高' : disease.risk === 'medium' ? '🟡 中' : '🟢 低'}风险
                                    </span>
                                </div>
                                <div class="disease-reason">${disease.reason}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="indicator-forecast">${detailData.agriIndicators.diseaseMonitoring.forecast}</div>
                    <div class="indicator-suggestion">
                        <i class="fas fa-lightbulb"></i>
                        ${detailData.agriIndicators.diseaseMonitoring.suggestion}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 未来7天风险预测 -->
        <div class="detail-section">
            <div class="section-title"><i class="fas fa-calendar-week"></i> 未来7天风险预测</div>
            <div class="future-timeline">
                ${detailData.futureRisks.timeline.map(day => `
                    <div class="timeline-day ${day.riskLevel}">
                        <div class="day-header">
                            <div class="day-info">
                                <span class="day-date">${day.date}</span>
                                <span class="day-datestr">${day.dateStr}</span>
                            </div>
                            <span class="day-icon">${day.icon}</span>
                        </div>
                        <div class="day-weather">${day.weather}</div>
                        <div class="day-temp">${day.temp}</div>
                        <div class="day-risks">
                            ${day.risks.map(risk => `<span class="risk-tag ${day.riskLevel}">${risk}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="future-alert">
                <i class="fas fa-bullhorn"></i>
                <span>${detailData.futureRisks.keyAlert}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="section-title"><i class="fas fa-lightbulb"></i> 农事建议</div>
            <div class="advice-card">
                <p>根据当前气象条件分析，${data.baseName}的${data.crop}正处于${data.growthStage}，建议：</p>
                <ul class="advice-list">
                    <li>密切关注天气变化，做好防范措施</li>
                    <li>适时进行田间管理，确保作物健康生长</li>
                    <li>注意病虫害防治，保障作物产量</li>
                </ul>
            </div>
        </div>
        
        <div class="detail-footer">
            <p class="update-time">更新时间：${new Date().toLocaleString('zh-CN')}</p>
        </div>
    `;
}

function showHistoryList() {
    const modal = document.getElementById('historyListModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeHistoryList() {
    const modal = document.getElementById('historyListModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function takeWeatherPhoto() {
    showNotification('拍摄天象功能开发中...', 'info');
}

function showWeatherMenu() {
    showNotification('菜单功能开发中...', 'info');
}

// 显示分享选项
function showShareOptions() {
    const phoneContent = document.getElementById('phoneContent');
    if (!phoneContent) return;
    
    // 创建分享弹窗
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.id = 'shareModal';
    shareModal.innerHTML = `
        <div class="share-overlay" onclick="closeShareModal()"></div>
        <div class="share-content">
            <div class="share-header">
                <h3>分享到</h3>
                <button class="share-close" onclick="closeShareModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="share-options">
                <div class="share-option" onclick="shareToWeChat()">
                    <div class="share-icon wechat">
                        <i class="fab fa-weixin"></i>
                    </div>
                    <div class="share-label">微信</div>
                </div>
                <div class="share-option" onclick="shareToMoments()">
                    <div class="share-icon moments">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="share-label">朋友圈</div>
                </div>
                <div class="share-option" onclick="shareAsImage()">
                    <div class="share-icon image">
                        <i class="fas fa-image"></i>
                    </div>
                    <div class="share-label">图片</div>
                </div>
                <div class="share-option" onclick="copyShareLink()">
                    <div class="share-icon link">
                        <i class="fas fa-link"></i>
                    </div>
                    <div class="share-label">复制链接</div>
                </div>
            </div>
        </div>
    `;
    
    phoneContent.appendChild(shareModal);
    
    // 延迟显示，触发动画
    setTimeout(() => {
        shareModal.classList.add('active');
    }, 10);
}

// 关闭分享弹窗
function closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 分享到微信
function shareToWeChat() {
    closeShareModal();
    showNotification('微信分享功能开发中，实际应用中将调用微信SDK', 'info');
}

// 分享到朋友圈
function shareToMoments() {
    closeShareModal();
    showNotification('朋友圈分享功能开发中，实际应用中将调用微信SDK', 'info');
}

// 分享为图片
function shareAsImage() {
    closeShareModal();
    
    // 检查是否有价格报告数据
    if (currentPriceReportData) {
        // 显示价格报告图片预览弹窗
        showPriceReportImagePreview(currentPriceReportData);
        return;
    }
    
    // 检查是否有气象数据
    if (!currentWeatherDetailData) {
        showNotification('无法获取数据', 'error');
        return;
    }
    
    // 显示图片预览弹窗
    showImagePreviewModal(currentWeatherDetailData);
}

// 复制分享链接
function copyShareLink() {
    const link = window.location.href;
    
    // 使用Clipboard API复制链接
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
            closeShareModal();
            showNotification('链接已复制到剪贴板', 'success');
        }).catch(() => {
            // 降级方案
            fallbackCopyLink(link);
        });
    } else {
        // 降级方案
        fallbackCopyLink(link);
    }
}

// 降级复制方案
function fallbackCopyLink(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        closeShareModal();
        showNotification('链接已复制到剪贴板', 'success');
    } catch (err) {
        showNotification('复制失败，请手动复制', 'error');
    }
    
    document.body.removeChild(textarea);
}

// 显示图片预览弹窗
function showImagePreviewModal(data) {
    const phoneContent = document.getElementById('phoneContent');
    if (!phoneContent) return;
    
    const trafficLightIcon = data.trafficLight === 'suitable' ? '🟢' : 
                            data.trafficLight === 'warning' ? '🟡' : '🔴';
    const trafficLightText = data.trafficLight === 'suitable' ? '适宜' : 
                            data.trafficLight === 'warning' ? '注意' : '禁止';
    
    const alertsText = data.alerts && data.alerts.length > 0 ? 
        data.alerts.map(alert => alert.text).join('；') : '暂无预警';
    
    // 创建图片预览弹窗
    const imageModal = document.createElement('div');
    imageModal.className = 'image-preview-modal';
    imageModal.id = 'imagePreviewModal';
    imageModal.innerHTML = `
        <div class="image-preview-overlay" onclick="closeImagePreviewModal()"></div>
        <div class="image-preview-content">
            <div class="image-preview-header">
                <h3>分享图片预览</h3>
                <button class="preview-close" onclick="closeImagePreviewModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="image-preview-body">
                <div class="share-image-card" id="shareImageCard">
                    <div class="share-card-header">
                        <div class="share-logo">
                            <i class="fas fa-cloud-sun-rain"></i>
                        </div>
                        <div class="share-title">
                            <h2>地块气象灾害预报</h2>
                            <p>精准预警 · 智能决策</p>
                        </div>
                    </div>
                    
                    <div class="share-card-content">
                        <div class="share-location-info">
                            <div class="share-traffic ${data.trafficLight}">
                                <span class="traffic-icon">${trafficLightIcon}</span>
                                <span class="traffic-text">${trafficLightText}</span>
                            </div>
                            <div class="share-location-text">
                                <h3>${data.location} · ${data.baseName}</h3>
                                <p>${data.crop} · ${data.growthStage}</p>
                            </div>
                        </div>
                        
                        <div class="share-weather-info">
                            <div class="share-weather-item">
                                <i class="fas fa-thermometer-half"></i>
                                <span>${data.currentWeather.temp}</span>
                            </div>
                            <div class="share-weather-item">
                                <i class="fas fa-tint"></i>
                                <span>${data.currentWeather.humidity}</span>
                            </div>
                            <div class="share-weather-item">
                                <i class="fas fa-wind"></i>
                                <span>${data.currentWeather.wind}</span>
                            </div>
                            <div class="share-weather-item">
                                <i class="fas fa-cloud"></i>
                                <span>${data.currentWeather.condition}</span>
                            </div>
                        </div>
                        
                        <div class="share-alert-info">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>${alertsText}</span>
                        </div>
                        
                        <div class="share-qrcode-section">
                            <div class="share-qrcode">
                                <div class="qrcode-placeholder">
                                    <i class="fas fa-qrcode"></i>
                                </div>
                            </div>
                            <div class="share-qrcode-text">
                                <p>扫码查看详情</p>
                                <p class="qrcode-hint">长按识别二维码</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="share-card-footer">
                        <p>更新时间：${new Date().toLocaleString('zh-CN')}</p>
                    </div>
                </div>
            </div>
            <div class="image-preview-actions">
                <button class="preview-action-btn download-btn" onclick="downloadShareImage()">
                    <i class="fas fa-download"></i>
                    <span>保存图片</span>
                </button>
                <button class="preview-action-btn secondary" onclick="closeImagePreviewModal()">
                    <span>取消</span>
                </button>
            </div>
        </div>
    `;
    
    phoneContent.appendChild(imageModal);
    
    // 延迟显示，触发动画
    setTimeout(() => {
        imageModal.classList.add('active');
    }, 10);
}

// 关闭图片预览弹窗
function closeImagePreviewModal() {
    const modal = document.getElementById('imagePreviewModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 显示价格报告图片预览
function showPriceReportImagePreview(data) {
    const phoneContent = document.getElementById('phoneContent');
    if (!phoneContent) return;
    
    const changeIcon = data.change >= 0 ? '↑' : '↓';
    const changeText = data.change >= 0 ? '上涨' : '下跌';
    const changeClass = data.change >= 0 ? 'positive' : 'negative';
    
    // 计算平均价格
    const avgPrice = data.historyData && data.historyData.length > 0 
        ? (data.historyData.reduce((sum, item) => sum + item.price, 0) / data.historyData.length).toFixed(2)
        : data.currentPrice.toFixed(2);
    
    // 创建图片预览弹窗
    const imageModal = document.createElement('div');
    imageModal.className = 'image-preview-modal';
    imageModal.id = 'imagePreviewModal';
    imageModal.innerHTML = `
        <div class="image-preview-overlay" onclick="closeImagePreviewModal()"></div>
        <div class="image-preview-content">
            <div class="image-preview-header">
                <h3>分享图片预览</h3>
                <button class="preview-close" onclick="closeImagePreviewModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="image-preview-body">
                <div class="share-image-card" id="shareImageCard">
                    <div class="share-card-header">
                        <div class="share-logo">
                            <i class="fas ${data.productName === '小麦' ? 'fa-wheat-awn' : data.productName === '玉米' ? 'fa-corn' : 'fa-seedling'}"></i>
                        </div>
                        <div class="share-title">
                            <h2>${data.productName}价格AI分析报告</h2>
                            <p>智能分析 · 精准预测</p>
                        </div>
                    </div>
                    
                    <div class="share-card-content">
                        <div class="share-location-info">
                            <div class="share-region-tag">
                                <span>${data.region || '全国'}</span>
                            </div>
                            <div class="share-location-text">
                                <h3>${data.productName}价格行情</h3>
                                <p>${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                        
                        <div class="share-price-info">
                            <div class="share-price-item">
                                <span class="price-label">当前价格</span>
                                <span class="price-value">¥${data.currentPrice.toFixed(2)}/斤</span>
                            </div>
                            <div class="share-price-item">
                                <span class="price-label">平均价格</span>
                                <span class="price-value">¥${avgPrice}/斤</span>
                            </div>
                            <div class="share-price-item ${changeClass}">
                                <span class="price-label">涨跌幅度</span>
                                <span class="price-value">${changeIcon} ${Math.abs(data.changePercent || 0).toFixed(1)}%</span>
                            </div>
                        </div>
                        
                        ${data.shortTermForecast ? `
                        <div class="share-forecast-info">
                            <i class="fas fa-chart-line"></i>
                            <span>${data.shortTermForecast}</span>
                        </div>
                        ` : ''}
                        
                        <div class="share-qrcode-section">
                            <div class="share-qrcode">
                                <div class="qrcode-placeholder">
                                    <i class="fas fa-qrcode"></i>
                                </div>
                            </div>
                            <div class="share-qrcode-text">
                                <p>扫码查看详情</p>
                                <p class="qrcode-hint">长按识别二维码</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="share-card-footer">
                        <p>更新时间：${new Date().toLocaleString('zh-CN')}</p>
                    </div>
                </div>
            </div>
            <div class="image-preview-actions">
                <button class="preview-action-btn download-btn" onclick="downloadShareImage()">
                    <i class="fas fa-download"></i>
                    <span>保存图片</span>
                </button>
                <button class="preview-action-btn secondary" onclick="closeImagePreviewModal()">
                    <span>取消</span>
                </button>
            </div>
        </div>
    `;
    
    phoneContent.appendChild(imageModal);
    
    // 延迟显示，触发动画
    setTimeout(() => {
        imageModal.classList.add('active');
    }, 10);
}

// 下载分享图片
function downloadShareImage() {
    // 实际应用中，这里应该使用html2canvas等库将DOM转换为图片
    showNotification('图片保存功能开发中，实际应用中将使用html2canvas生成图片', 'info');
}

function copyWeatherMessage(btn) {
    const bubble = btn.closest('.weather-message-content').querySelector('.weather-message-bubble');
    if (bubble) {
        navigator.clipboard.writeText(bubble.textContent);
        showNotification('已复制到剪贴板', 'success');
    }
}

function likeWeatherMessage(btn) {
    btn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
    btn.style.color = '#21c08b';
    showNotification('感谢您的反馈', 'success');
}

// ==================== 气象灾害预警报告相关函数 ====================

// 初始化气象预警Banner
function initWeatherAlertBanner() {
    const banner = document.getElementById('weatherAlertBanner');
    if (!banner) return;
    
    // 获取当前位置（模拟数据，实际应从GPS或用户设置获取）
    const location = {
        city: '柘城县',
        province: '河南省商丘市',
        lat: 34.0865,
        lng: 115.6699
    };
    
    // 获取当前预警状态（模拟数据）
    const alertStatus = getCurrentAlertStatus(location);
    
    // 更新Banner样式和内容
    updateWeatherBanner(banner, alertStatus, location);
}

// 获取当前预警状态（模拟数据）
function getCurrentAlertStatus(location) {
    // 模拟数据：实际应从API获取
    const alerts = [
        { type: 'rain', level: 'yellow', text: '暴雨黄色预警生效中', time: '2024-10-27 08:00' }
    ];
    
    // 计算最高预警级别
    let maxLevel = 'none'; // none, blue, yellow, orange, red
    if (alerts.length > 0) {
        const levels = alerts.map(a => a.level);
        if (levels.includes('red')) maxLevel = 'red';
        else if (levels.includes('orange')) maxLevel = 'orange';
        else if (levels.includes('yellow')) maxLevel = 'yellow';
        else if (levels.includes('blue')) maxLevel = 'blue';
    }
    
    // 获取当前天气数据（模拟）
    const currentWeather = {
        temp: '15℃',
        tempRange: '10℃-15℃',
        condition: '暴雨',
        wind: '八级大风'
    };
    
    // 获取主要作物防护提示（模拟）
    const mainCrop = '辣椒';
    
    return {
        level: maxLevel,
        alerts: alerts,
        hasAlert: alerts.length > 0,
        currentWeather: currentWeather,
        mainCrop: mainCrop
    };
}

// 更新Banner显示
function updateWeatherBanner(banner, alertStatus, location) {
    const bannerIcon = document.getElementById('bannerIcon');
    const bannerTitle = document.getElementById('bannerTitle');
    const bannerSubtitle = document.getElementById('bannerSubtitle');
    
    if (!banner || !bannerIcon || !bannerTitle) return;
    
    // 根据预警级别设置样式
    let bgColor, icon, title, iconClass;
    
    if (alertStatus.level === 'red' || alertStatus.level === 'orange' || alertStatus.level === 'yellow' || alertStatus.level === 'blue') {
        // 有预警的情况
        if (alertStatus.level === 'red' || alertStatus.level === 'orange') {
            // 危急态
            bgColor = 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)';
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            iconClass = 'danger';
        } else {
            // 关注态（黄色、蓝色）
            bgColor = 'linear-gradient(135deg, #faad14 0%, #d48806 100%)';
            icon = '<i class="fas fa-cloud-rain"></i>';
            iconClass = 'warning';
        }
        
        // 获取预警类型
        const alertType = alertStatus.alerts[0]?.type === 'rain' ? '暴雨' : 
                         alertStatus.alerts[0]?.type === 'wind' ? '大风' : 
                         alertStatus.alerts[0]?.type === 'heat' ? '高温' : '预警';
        
        // 获取城市简称（去掉"县"、"市"等后缀）
        const cityShort = location.city.replace(/[县市区]$/, '');
        
        // 获取温度范围
        const tempRange = alertStatus.currentWeather?.tempRange || '10℃-15℃';
        
        // 获取风力
        const wind = alertStatus.currentWeather?.wind || '八级大风';
        
        // 格式化标题：柘城 今日天气（暴雨 10℃-15℃ 八级大风）点击查看气象灾害专属报告
        title = `${cityShort} 今日天气（${alertType} ${tempRange} ${wind}）`;
        
        // 副标题显示：点击查看气象灾害专属报告
        if (bannerSubtitle) {
            bannerSubtitle.textContent = '点击查看气象灾害专属报告';
        }
    } else {
        // 平安态
        bgColor = 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)';
        icon = '<i class="fas fa-sun"></i>';
        title = `${location.city}今日气象平稳，适宜农事作业`;
        iconClass = 'safe';
    }
    
    banner.style.background = bgColor;
    bannerIcon.innerHTML = icon;
    bannerIcon.className = `banner-icon ${iconClass}`;
    bannerTitle.textContent = title;
    
    // 确保副标题显示"点击查看详细预报"
    if (bannerSubtitle) {
        bannerSubtitle.textContent = '点击查看详细预报';
    }
}

// 当前选中的城市
let currentReportCity = {
    city: '柘城县',
    province: '河南省商丘市',
    fullName: '河南省商丘市柘城县',
    lat: 34.0865,
    lng: 115.6699
};

// 加载气象报告页面
function loadWeatherReport() {
    loadPage('weatherReport');
}

// 渲染气象报告内容
function renderWeatherReport() {
    // 先显示加载提示
    showWeatherReportLoading();
    // 延迟后生成报告卡片
    setTimeout(() => {
        showWeatherReportCard();
    }, 1500);
}

// 显示报告加载提示
function showWeatherReportLoading() {
    const container = document.getElementById('weatherReportContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="weather-report-loading">
            <div class="loading-icon">
                <i class="fas fa-cloud-sun-rain"></i>
            </div>
            <div class="loading-text">正在为您生成报告中，请稍后...</div>
        </div>
    `;
    
    // 隐藏分享按钮
    const shareBtn = document.getElementById('weatherReportShareBtn');
    if (shareBtn) {
        shareBtn.style.display = 'none';
    }
}

// 显示报告卡片预览
function showWeatherReportCard() {
    const container = document.getElementById('weatherReportContent');
    if (!container) return;
    
    const reportData = generateWeatherReportData(currentReportCity);
    const alertType = reportData.currentAlerts.length > 0 ? 
        (reportData.currentAlerts[0].type === 'rain' ? '暴雨' : 
         reportData.currentAlerts[0].type === 'wind' ? '大风' : 
         reportData.currentAlerts[0].type === 'heat' ? '高温' : '预警') : '无预警';
    
    // 获取主要作物影响（优先取isMain为true的，否则取第一个）
    const mainCrop = reportData.cropImpacts.find(crop => crop.isMain) || reportData.cropImpacts[0];
    const cropImpactHtml = mainCrop ? `
        <div class="report-card-crop-impact">
            <i class="fas fa-seedling"></i>
            <span class="crop-impact-text">${mainCrop.crop}：${mainCrop.riskText}</span>
        </div>
    ` : '';
    
    container.innerHTML = `
        <div class="weather-report-card-container">
            <div class="weather-report-card" onclick="showWeatherReportDetail()">
                <div class="report-card-header">
                    <div class="report-card-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="report-card-title">${currentReportCity.city}·城市气象灾害预警报告</div>
                </div>
                <div class="report-card-content">
                    <div class="report-card-alert">
                        <span class="alert-type">${alertType}</span>
                        <span class="alert-level">${reportData.currentAlerts.length > 0 ? getAlertLevelText(reportData.currentAlerts[0].level) : '无预警'}</span>
                    </div>
                    <div class="report-card-risk">
                        <span class="risk-label">风险指数：</span>
                        <span class="risk-value ${reportData.riskScore >= 30 ? 'high' : reportData.riskScore >= 15 ? 'medium' : 'low'}">${reportData.riskLevel}</span>
                    </div>
                    ${cropImpactHtml}
                    <div class="report-card-time">${reportData.updateTime} 更新</div>
                </div>
                <div class="report-card-footer">
                    <span class="view-report-text">点击查看详细报告</span>
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
            <div class="city-switch-section">
                <button class="city-switch-btn" onclick="showCitySelector()">
                    <i class="fas fa-exchange-alt"></i>
                    <span>切换城市</span>
                </button>
            </div>
        </div>
    `;
    
    // 隐藏分享按钮
    const shareBtn = document.getElementById('weatherReportShareBtn');
    if (shareBtn) {
        shareBtn.style.display = 'none';
    }
}

// 显示报告详情
function showWeatherReportDetail() {
    const container = document.getElementById('weatherReportContent');
    const shareBtn = document.getElementById('weatherReportShareBtn');
    if (!container) return;
    
    const reportData = generateWeatherReportData(currentReportCity);
    container.innerHTML = generateReportHTML(reportData, currentReportCity);
    
    // 显示分享按钮
    if (shareBtn) {
        shareBtn.style.display = 'block';
    }
    
    // 滚动到顶部
    container.scrollTop = 0;
}

// 显示城市选择器
function showCitySelector() {
    const cities = [
        { city: '柘城县', province: '河南省商丘市', fullName: '河南省商丘市柘城县', lat: 34.0865, lng: 115.6699 },
        { city: '郑州市', province: '河南省', fullName: '河南省郑州市', lat: 34.7466, lng: 113.6254 },
        { city: '商丘市', province: '河南省', fullName: '河南省商丘市', lat: 34.4371, lng: 115.6564 },
        { city: '周口市', province: '河南省', fullName: '河南省周口市', lat: 33.6204, lng: 114.6969 }
    ];
    
    const cityOptions = cities.map(city => 
        `<div class="city-option ${city.city === currentReportCity.city ? 'active' : ''}" onclick="selectReportCity('${city.city}')">
            <i class="fas fa-map-marker-alt"></i>
            <span>${city.city}</span>
            ${city.city === currentReportCity.city ? '<i class="fas fa-check"></i>' : ''}
        </div>`
    ).join('');
    
    const container = document.getElementById('weatherReportContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="city-selector-modal">
            <div class="city-selector-header">
                <h3>选择城市</h3>
                <button class="close-btn" onclick="showWeatherReportCard()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="city-selector-content">
                ${cityOptions}
            </div>
        </div>
    `;
    
    // 隐藏分享按钮
    const shareBtn = document.getElementById('weatherReportShareBtn');
    if (shareBtn) {
        shareBtn.style.display = 'none';
    }
}

// 选择城市
function selectReportCity(cityName) {
    const cities = {
        '柘城县': { city: '柘城县', province: '河南省商丘市', fullName: '河南省商丘市柘城县', lat: 34.0865, lng: 115.6699 },
        '郑州市': { city: '郑州市', province: '河南省', fullName: '河南省郑州市', lat: 34.7466, lng: 113.6254 },
        '商丘市': { city: '商丘市', province: '河南省', fullName: '河南省商丘市', lat: 34.4371, lng: 115.6564 },
        '周口市': { city: '周口市', province: '河南省', fullName: '河南省周口市', lat: 33.6204, lng: 114.6969 }
    };
    
    if (cities[cityName]) {
        currentReportCity = cities[cityName];
        // 重新生成报告卡片
        showWeatherReportLoading();
        setTimeout(() => {
            showWeatherReportCard();
        }, 1500);
    }
}

// 从详情页面显示城市选择器
function showCitySelectorFromDetail() {
    showCitySelector();
}

// 生成城市级报告数据（简单版本）
function generateWeatherReportData(location) {
    // 当前预警
    const currentAlerts = [
        {
            type: 'rain',
            level: 'yellow',
            title: '暴雨黄色预警',
            time: '2024-10-27 08:00',
            unit: '商丘市气象台',
            content: '预计未来6小时内，柘城县部分地区降雨量将达50毫米以上，请注意防范。'
        }
    ];
    
    // 当前天气
    const currentWeather = {
        temp: '15°C',
        humidity: '85%',
        wind: '8级',
        condition: '暴雨'
    };
    
    // 近七天天气
    const sevenDayWeather = [
        {
            date: '今天',
            dateStr: '10-27',
            weather: '暴雨',
            icon: '🌧️',
            temp: '10-15℃',
            risks: ['积水风险', '病害传播'],
            riskLevel: 'high'
        },
        {
            date: '明天',
            dateStr: '10-28',
            weather: '阴转多云',
            icon: '⛅',
            temp: '12-18℃',
            risks: ['高湿环境', '病害高发期'],
            riskLevel: 'medium'
        },
        {
            date: '后天',
            dateStr: '10-29',
            weather: '多云',
            icon: '☁️',
            temp: '14-20℃',
            risks: ['天气平稳', '适宜田管'],
            riskLevel: 'low'
        },
        {
            date: '第4天',
            dateStr: '10-30',
            weather: '晴',
            icon: '☀️',
            temp: '16-22℃',
            risks: ['天气平稳', '适宜田管'],
            riskLevel: 'low'
        },
        {
            date: '第5天',
            dateStr: '10-31',
            weather: '晴',
            icon: '☀️',
            temp: '18-24℃',
            risks: ['天气平稳', '适宜田管'],
            riskLevel: 'low'
        },
        {
            date: '第6天',
            dateStr: '11-01',
            weather: '多云',
            icon: '☁️',
            temp: '16-22℃',
            risks: ['天气平稳', '适宜田管'],
            riskLevel: 'low'
        },
        {
            date: '第7天',
            dateStr: '11-02',
            weather: '小雨',
            icon: '🌦️',
            temp: '14-20℃',
            risks: ['轻微降雨', '注意防雨'],
            riskLevel: 'low'
        }
    ];
    
    const sevenDayKeyAlert = '特别关注：降雨后转晴，2-3天内是病虫害防治关键期！';
    
    // 农业影响分析
    const cropImpacts = [
        {
            crop: '辣椒',
            riskLevel: 'high',
            riskText: '高风险',
            impact: '当前暴雨预警可能导致低洼地块积水，辣椒根系浅，浸泡超过12小时极易引发根腐病和疫病，导致死棵。',
            isMain: true
        },
        {
            crop: '夏玉米',
            riskLevel: 'medium',
            riskText: '中风险',
            impact: '伴随的6级阵风可能导致部分高秆玉米倒伏。'
        },
        {
            crop: '设施农业（大棚）',
            riskLevel: 'low',
            riskText: '低风险',
            impact: '当前风力对标准钢架大棚无威胁，注意关闭风口防雨即可。'
        }
    ];
    
    // 防范建议（城市级别，简单版本）
    const advice = [
        '关注天气变化，及时了解最新预警信息',
        '加强田间管理，确保排水系统畅通',
        '根据预警级别，及时采取防范措施',
        '如需专业指导，请咨询气象灾害智能体'
    ];
    
    // 风险指数计算
    let riskScore = 0;
    if (currentAlerts.length > 0) {
        currentAlerts.forEach(alert => {
            if (alert.level === 'red') riskScore += 40;
            else if (alert.level === 'orange') riskScore += 30;
            else if (alert.level === 'yellow') riskScore += 20;
            else if (alert.level === 'blue') riskScore += 10;
        });
    }
    
    const riskLevel = riskScore >= 30 ? '高风险' : riskScore >= 15 ? '中风险' : '低风险';
    
    return {
        currentAlerts,
        currentWeather,
        sevenDayWeather,
        sevenDayKeyAlert,
        cropImpacts,
        advice,
        riskScore,
        riskLevel,
        updateTime: new Date().toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    };
}

// 生成报告HTML
function generateReportHTML(data, location) {
    const alertsHTML = data.currentAlerts.length > 0 ? 
        data.currentAlerts.map(alert => `
            <div class="report-alert-card ${alert.level}">
                <div class="alert-card-header">
                    <div class="alert-icon-wrapper">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alert-info">
                        <div class="alert-title">${alert.title}</div>
                        <div class="alert-meta">${alert.time} · ${alert.unit}</div>
                    </div>
                    <div class="alert-level-badge ${alert.level}">${getAlertLevelText(alert.level)}</div>
                </div>
                <div class="alert-content">${alert.content}</div>
            </div>
        `).join('') : 
        `<div class="report-no-alert">
            <div class="no-alert-icon">🛡️</div>
            <div class="no-alert-text">当前无生效的气象灾害预警，天气状况良好</div>
        </div>`;
    
    const cropImpactsHTML = data.cropImpacts.map(crop => `
        <div class="crop-impact-card ${crop.riskLevel}">
            <div class="crop-header">
                <div class="crop-name">${crop.crop}${crop.isMain ? ' <span class="main-crop-tag">核心经济作物</span>' : ''}</div>
                <div class="risk-badge ${crop.riskLevel}">
                    ${crop.riskLevel === 'high' ? '🔴' : crop.riskLevel === 'medium' ? '🟡' : '🟢'} ${crop.riskText}
                </div>
            </div>
            <div class="crop-impact">${crop.impact}</div>
        </div>
    `).join('');
    
    return `
        <!-- 报告头部 -->
        <div class="report-header">
            <div class="report-title">${location.city}·城市气象灾害预警报告</div>
            <div class="report-meta">
                <div class="report-time">${data.updateTime} 更新</div>
                <div class="report-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${location.city}</span>
                </div>
            </div>
            <div class="risk-gauge">
                <div class="gauge-label">风险指数</div>
                <div class="gauge-value ${data.riskScore >= 30 ? 'high' : data.riskScore >= 15 ? 'medium' : 'low'}">${data.riskLevel}</div>
                <div class="gauge-bar">
                    <div class="gauge-fill" style="width: ${data.riskScore}%"></div>
                </div>
            </div>
        </div>
        
        <!-- 模块一：当前灾害预警 -->
        <div class="report-section">
            <div class="section-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>当前灾害预警</h2>
            </div>
            <div class="section-content">
                ${alertsHTML}
            </div>
        </div>
        
        <!-- 模块二：当前天气 -->
        <div class="report-section">
            <div class="section-header">
                <i class="fas fa-cloud-sun"></i>
                <h2>当前天气</h2>
            </div>
            <div class="section-content">
                <div class="weather-grid">
                    <div class="weather-grid-item">
                        <i class="fas fa-thermometer-half"></i>
                        <div class="weather-label">温度</div>
                        <div class="weather-value">${data.currentWeather.temp}</div>
                    </div>
                    <div class="weather-grid-item">
                        <i class="fas fa-tint"></i>
                        <div class="weather-label">湿度</div>
                        <div class="weather-value">${data.currentWeather.humidity}</div>
                    </div>
                    <div class="weather-grid-item">
                        <i class="fas fa-wind"></i>
                        <div class="weather-label">风力</div>
                        <div class="weather-value">${data.currentWeather.wind}</div>
                    </div>
                    <div class="weather-grid-item">
                        <i class="fas fa-cloud"></i>
                        <div class="weather-label">天气</div>
                        <div class="weather-value">${data.currentWeather.condition}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 模块三：近七天天气 -->
        <div class="report-section">
            <div class="section-header">
                <i class="fas fa-calendar-week"></i>
                <h2>未来7天风险预测</h2>
            </div>
            <div class="section-content">
                <div class="future-timeline">
                    ${data.sevenDayWeather.map(day => `
                        <div class="timeline-day ${day.riskLevel}">
                            <div class="day-header">
                                <div class="day-info">
                                    <span class="day-date">${day.date}</span>
                                    <span class="day-datestr">${day.dateStr}</span>
                                </div>
                                <span class="day-icon">${day.icon}</span>
                            </div>
                            <div class="day-weather">${day.weather}</div>
                            <div class="day-temp">${day.temp}</div>
                            <div class="day-risks">
                                ${day.risks.map(risk => `<span class="risk-tag ${day.riskLevel}">${risk}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="future-alert">
                    <i class="fas fa-bullhorn"></i>
                    <span>${data.sevenDayKeyAlert}</span>
                </div>
            </div>
        </div>
        
        <!-- 模块四：气象对作物的影响评估 -->
        <div class="report-section">
            <div class="section-header">
                <i class="fas fa-seedling"></i>
                <h2>气象对作物的影响评估</h2>
            </div>
            <div class="section-content">
                ${cropImpactsHTML}
            </div>
        </div>
        
        <!-- 模块五：AI防范建议 -->
        <div class="report-section">
            <div class="section-header">
                <i class="fas fa-robot"></i>
                <h2>AI防范建议</h2>
            </div>
            <div class="section-content">
                <div class="ai-advice-container">
                    <div class="advice-chart-section">
                        <div class="advice-chart-card">
                            <div class="chart-title">风险等级分布</div>
                            <div class="risk-distribution-chart">
                                <div class="risk-item high">
                                    <div class="risk-bar" style="width: 40%;"></div>
                                    <span class="risk-label">高风险</span>
                                    <span class="risk-value">40%</span>
                                </div>
                                <div class="risk-item medium">
                                    <div class="risk-bar" style="width: 35%;"></div>
                                    <span class="risk-label">中风险</span>
                                    <span class="risk-value">35%</span>
                                </div>
                                <div class="risk-item low">
                                    <div class="risk-bar" style="width: 25%;"></div>
                                    <span class="risk-label">低风险</span>
                                    <span class="risk-value">25%</span>
                                </div>
                            </div>
                        </div>
                        <div class="advice-chart-card">
                            <div class="chart-title">防范措施优先级</div>
                            <div class="priority-list">
                                <div class="priority-item high">
                                    <div class="priority-number">1</div>
                                    <div class="priority-content">
                                        <div class="priority-title">紧急排水</div>
                                        <div class="priority-desc">低洼地块立即启动排水系统，防止积水超过12小时</div>
                                    </div>
                                </div>
                                <div class="priority-item medium">
                                    <div class="priority-number">2</div>
                                    <div class="priority-content">
                                        <div class="priority-title">病害预防</div>
                                        <div class="priority-desc">降雨后2-3天内是病害高发期，提前预防性用药</div>
                                    </div>
                                </div>
                                <div class="priority-item low">
                                    <div class="priority-number">3</div>
                                    <div class="priority-content">
                                        <div class="priority-title">设施加固</div>
                                        <div class="priority-desc">检查并加固大棚设施，确保能抵御8级大风</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="advice-text-section">
                        <ol class="advice-list">
                            ${data.advice.map((item, index) => `<li>${item}</li>`).join('')}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 底部城市切换 -->
        <div class="report-footer">
            <button class="city-switch-btn" onclick="showCitySelectorFromDetail()">
                <i class="fas fa-exchange-alt"></i>
                <span>切换城市</span>
            </button>
        </div>
    `;
}

// 生成历史统计图表HTML
function generateHistoryChartHTML(stats) {
    const maxCount = Math.max(...stats.trend.map(d => d.count), 1);
    
    const trendBars = stats.trend.map(d => `
        <div class="trend-bar-item">
            <div class="trend-bar" style="height: ${(d.count / maxCount) * 100}%"></div>
            <div class="trend-label">${d.date}</div>
            <div class="trend-value">${d.count}</div>
        </div>
    `).join('');
    
    const typePie = stats.byType.map((type, index) => `
        <div class="pie-item">
            <div class="pie-color" style="background: ${getTypeColor(type.type)}"></div>
            <div class="pie-label">${type.type}</div>
            <div class="pie-value">${type.count}次 (${type.percent}%)</div>
        </div>
    `).join('');
    
    return `
        <div class="history-summary">
            <div class="summary-stat">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">总预警次数</div>
            </div>
        </div>
        <div class="history-charts">
            <div class="chart-container">
                <div class="chart-title">每日预警次数趋势</div>
                <div class="trend-chart">
                    ${trendBars}
                </div>
            </div>
            <div class="chart-container">
                <div class="chart-title">灾害类型分布</div>
                <div class="pie-chart">
                    ${typePie}
                </div>
            </div>
        </div>
    `;
}

// 获取预警级别文本
function getAlertLevelText(level) {
    const map = {
        'red': '红色',
        'orange': '橙色',
        'yellow': '黄色',
        'blue': '蓝色'
    };
    return map[level] || level;
}

// 获取灾害类型颜色
function getTypeColor(type) {
    const map = {
        '大风': '#FF6B6B',
        '暴雨': '#4ECDC4',
        '高温': '#FFA07A',
        '冰雹': '#95E1D3',
        '其他': '#F38181'
    };
    return map[type] || '#999';
}

// 咨询气象智能体
function consultWeatherAgent() {
    loadWeatherDisasterAgent();
    setTimeout(() => {
        addWeatherMessage('user', '帮我解读刚才的报告', 'text');
        setTimeout(() => {
            addWeatherMessage('ai', '好的，我来为您详细解读这份气象灾害分析报告...', 'text');
        }, 500);
    }, 500);
}

// 分享报告
function shareWeatherReport() {
    showShareOptions();
}

// 分享价格报告
function sharePriceReport() {
    showShareOptions();
}

// 存储当前价格报告数据
let currentPriceReportData = null;

// 显示位置选择器
function showLocationSelector() {
    showNotification('位置切换功能开发中', 'info');
}

// ==================== 农产品价格智能体相关函数 ====================

// 小麦主产区数据（省份和县区）
const wheatMainRegions = {
    '全国': {
        name: '全国',
        counties: []
    },
    '河南': {
        name: '河南',
        counties: ['周口', '新乡', '开封', '商丘']
    },
    '山东': {
        name: '山东',
        counties: ['潍坊', '德州', '滨州', '济宁']
    },
    '河北': {
        name: '河北',
        counties: ['石家庄', '衡水', '邢台']
    },
    '山西': {
        name: '山西',
        counties: ['运城', '临汾']
    },
    '江苏': {
        name: '江苏',
        counties: ['徐州', '连云港']
    }
};

// 价格智能体模拟数据
const priceAgentData = {
    '小麦': {
        name: '小麦',
        region: '河南',
        currentPrice: 2.65,
        priceUnit: '元/斤',
        change: 0.08,
        changePercent: 3.1,
        insight: '受雨雪影响，河南局部看涨',
        shortTermForecast: '预计未来3-5天价格将继续保持上涨态势，受降雪天气影响，运输成本上升，建议密切关注天气变化及市场动态。',
        sparklineData: [2.50, 2.52, 2.55, 2.58, 2.60, 2.62, 2.65],
        historyData: [
            { date: '01-04', price: 2.50 },
            { date: '01-05', price: 2.52 },
            { date: '01-06', price: 2.55 },
            { date: '01-07', price: 2.58 },
            { date: '01-08', price: 2.60 },
            { date: '01-09', price: 2.62 },
            { date: '01-10', price: 2.65 }
        ],
        forecastData: [
            { date: '01-11', price: 2.68 },
            { date: '01-12', price: 2.70 },
            { date: '01-13', price: 2.72 },
            { date: '01-14', price: 2.75 }
        ],
        regionData: [
            { region: '河南', price: 2.65, trend: 'up' },
            { region: '山东', price: 2.62, trend: 'stable' },
            { region: '河北', price: 2.60, trend: 'up' },
            { region: '安徽', price: 2.58, trend: 'down' },
            { region: '江苏', price: 2.55, trend: 'stable' }
        ],
        aiAdvice: {
            trend: 'up',
            summary: '短期内价格将保持上涨趋势',
            details: [
                '天气因素：降雪天气影响运输，推高物流成本，支撑价格上涨',
                '市场需求：春节前备货需求旺盛，面粉企业采购积极',
                '供应情况：农户惜售情绪较浓，市场流通粮源偏紧',
                '政策面：收储政策平稳，市场运行正常',
                '建议：当前价格处于合理区间，可根据自身情况选择出售时机，建议分批次出售降低风险'
            ],
            risks: ['天气转好后运输成本下降', '市场供应量增加', '节后需求回落'],
            opportunities: ['春节前备货需求持续', '天气因素持续影响', '农户惜售支撑价格']
        }
    },
    '玉米': {
        name: '玉米',
        region: '东北地区',
        currentPrice: 1.45,
        priceUnit: '元/斤',
        change: -0.03,
        changePercent: -2.0,
        insight: '供应充足，价格小幅回落',
        sparklineData: [1.50, 1.49, 1.48, 1.47, 1.46, 1.45, 1.45],
        historyData: [
            { date: '01-04', price: 1.50 },
            { date: '01-05', price: 1.49 },
            { date: '01-06', price: 1.48 },
            { date: '01-07', price: 1.47 },
            { date: '01-08', price: 1.46 },
            { date: '01-09', price: 1.45 },
            { date: '01-10', price: 1.45 }
        ],
        forecastData: [
            { date: '01-11', price: 1.44 },
            { date: '01-12', price: 1.43 },
            { date: '01-13', price: 1.43 },
            { date: '01-14', price: 1.42 }
        ],
        regionData: [
            { region: '黑龙江', price: 1.48, trend: 'down' },
            { region: '吉林', price: 1.45, trend: 'down' },
            { region: '辽宁', price: 1.43, trend: 'stable' },
            { region: '内蒙古', price: 1.42, trend: 'down' },
            { region: '山东', price: 1.40, trend: 'stable' }
        ],
        decision: {
            type: 'sell',
            title: '建议出货',
            content: '价格呈下行趋势，供应量持续增加。建议农户及时出货，避免后期价格继续下跌带来的损失。',
            risks: ['供应持续增加', '需求增长放缓'],
            opportunities: ['饲料企业定期采购', '出口订单增加']
        }
    },
    '大豆': {
        name: '大豆',
        region: '黑龙江地区',
        currentPrice: 3.20,
        priceUnit: '元/斤',
        change: 0.05,
        changePercent: 1.6,
        insight: '国际市场带动，稳中有升',
        sparklineData: [3.10, 3.12, 3.14, 3.16, 3.17, 3.18, 3.20],
        historyData: [
            { date: '01-04', price: 3.10 },
            { date: '01-05', price: 3.12 },
            { date: '01-06', price: 3.14 },
            { date: '01-07', price: 3.16 },
            { date: '01-08', price: 3.17 },
            { date: '01-09', price: 3.18 },
            { date: '01-10', price: 3.20 }
        ],
        forecastData: [
            { date: '01-11', price: 3.22 },
            { date: '01-12', price: 3.24 },
            { date: '01-13', price: 3.25 },
            { date: '01-14', price: 3.27 }
        ],
        regionData: [
            { region: '黑龙江', price: 3.20, trend: 'up' },
            { region: '吉林', price: 3.18, trend: 'up' },
            { region: '内蒙古', price: 3.15, trend: 'stable' },
            { region: '辽宁', price: 3.12, trend: 'up' },
            { region: '河北', price: 3.10, trend: 'stable' }
        ],
        decision: {
            type: 'hold',
            title: '建议持有观望',
            content: '受国际市场影响，价格稳步上涨。建议农户继续持有，密切关注国际市场动态。',
            risks: ['国际市场波动', '汇率变化影响'],
            opportunities: ['进口大豆价格上涨', '国内需求稳定']
        }
    }
};

// 初始化首页价格趋势图（Sparkline）
function initPriceSparkline() {
    const canvas = document.getElementById('priceSparklineCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = priceAgentData['小麦'].sparklineData;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 计算数据范围
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue;
    
    // 绘制参数
    const padding = 5;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    const step = width / (data.length - 1);
    
    // 绘制线条
    ctx.beginPath();
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    
    data.forEach((value, index) => {
        const x = padding + index * step;
        const y = padding + height - ((value - minValue) / range) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // 绘制渐变填充
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(255, 107, 107, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
    
    ctx.lineTo(padding + (data.length - 1) * step, padding + height);
    ctx.lineTo(padding, padding + height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
}

// 进入价格智能体（从首页卡片或智能体广场）
function enterPriceAgent(productName) {
    const pageMap = {
        '小麦': 'wheatPriceAgent',
        '玉米': 'cornPriceAgent',
        '大豆': 'soyPriceAgent'
    };
    const pageName = pageMap[productName] || 'wheatPriceAgent';
    loadPage(pageName, productName);
}

// 初始化价格智能体主页（新）
function initPriceAgentHome(pageName) {
    const productMap = {
        'wheatPriceAgent': '小麦',
        'cornPriceAgent': '玉米',
        'soyPriceAgent': '大豆'
    };
    const productName = productMap[pageName] || '小麦';
    
    // 创建示例弹窗
    setTimeout(() => {
        createPriceExamplesModal(productName);
    }, 100);
}

// 创建价格智能体示例弹窗
function createPriceExamplesModal(productName) {
    // 如果弹窗已存在，先移除
    const existingModal = document.getElementById('priceExamplesModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const phoneContent = document.getElementById('phoneContent');
    if (!phoneContent) return;
    
    // 根据产品选择不同的示例
    const examplesMap = {
        '小麦': [
            { title: '实时价格', question: '今天郑州小麦多少钱一斤？', icon: 'fa-dollar-sign' },
            { title: '价格趋势', question: '最近7天河南小麦价格趋势？', icon: 'fa-chart-line' },
            { title: '卖粮建议', question: '现在适合卖小麦吗？', icon: 'fa-lightbulb' },
            { title: '价格预测', question: '预测未来3天小麦价格走势', icon: 'fa-crystal-ball' },
            { title: '区域对比', question: '河南和山东小麦价格对比', icon: 'fa-map-marked-alt' },
            { title: '市场分析', question: '影响小麦价格的主要因素', icon: 'fa-search-dollar' }
        ],
        '玉米': [
            { title: '实时价格', question: '今天吉林玉米多少钱一斤？', icon: 'fa-dollar-sign' },
            { title: '价格趋势', question: '最近7天东北玉米价格趋势？', icon: 'fa-chart-line' },
            { title: '卖粮建议', question: '现在适合卖玉米吗？', icon: 'fa-lightbulb' },
            { title: '价格预测', question: '预测未来3天玉米价格走势', icon: 'fa-crystal-ball' },
            { title: '区域对比', question: '东北和华北玉米价格对比', icon: 'fa-map-marked-alt' },
            { title: '市场分析', question: '影响玉米价格的主要因素', icon: 'fa-search-dollar' }
        ],
        '大豆': [
            { title: '实时价格', question: '今天黑龙江大豆多少钱一斤？', icon: 'fa-dollar-sign' },
            { title: '价格趋势', question: '最近7天大豆价格趋势？', icon: 'fa-chart-line' },
            { title: '卖粮建议', question: '现在适合卖大豆吗？', icon: 'fa-lightbulb' },
            { title: '价格预测', question: '预测未来3天大豆价格走势', icon: 'fa-crystal-ball' },
            { title: '区域对比', question: '黑龙江和内蒙古大豆价格对比', icon: 'fa-map-marked-alt' },
            { title: '市场分析', question: '影响大豆价格的主要因素', icon: 'fa-search-dollar' }
        ]
    };
    
    const examples = examplesMap[productName] || examplesMap['小麦'];
    
    const modal = document.createElement('div');
    modal.id = 'priceExamplesModal';
    modal.className = 'price-examples-modal';
    modal.innerHTML = `
        <div class="price-modal-overlay" onclick="hidePriceExamplesModal()"></div>
        <div class="price-modal-content">
            <div class="price-modal-header">
                <h3>常见问题示例</h3>
                <button class="close-btn" onclick="hidePriceExamplesModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="price-modal-body">
                ${examples.map(ex => `
                    <div class="price-example-item" onclick="usePriceExample('${ex.question}', '${productName}')">
                        <div class="example-icon">
                            <i class="fas ${ex.icon}"></i>
                        </div>
                        <div class="example-text">
                            <div class="example-title">${ex.title}</div>
                            <div class="example-desc">${ex.question}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    phoneContent.appendChild(modal);
}

// 显示价格示例弹窗
function showPriceExamplesModal(productName) {
    const modal = document.getElementById('priceExamplesModal');
    if (!modal) {
        createPriceExamplesModal(productName);
        setTimeout(() => {
            const newModal = document.getElementById('priceExamplesModal');
            if (newModal) newModal.classList.add('show');
        }, 10);
    } else {
        modal.classList.add('show');
    }
}

// 隐藏价格示例弹窗
function hidePriceExamplesModal() {
    const modal = document.getElementById('priceExamplesModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// 使用价格示例
function usePriceExample(question, productName) {
    hidePriceExamplesModal();
    const input = document.getElementById('priceHomeInput');
    if (input) {
        input.value = question;
        // 自动触发发送
        setTimeout(() => {
            startPriceHomeChat(productName);
        }, 300);
    }
}

// 开始价格主页对话
function startPriceHomeChat(productName) {
    const input = document.getElementById('priceHomeInput');
    const message = input ? input.value.trim() : '';

    if (!message) {
        showNotification('请输入您的问题', 'warning');
        return;
    }

    // 跳转到价格对话页面
    loadPriceChatPage(productName, message);
}

// 获取默认地区
function getDefaultRegion(productName) {
    const regionMap = {
        '小麦': '河南',
        '玉米': '东北',
        '大豆': '黑龙江'
    };
    return regionMap[productName] || '河南';
}

// 加载价格对话页面
function loadPriceChatPage(productName, initialMessage) {
    window.currentPriceProduct = productName;
    loadPage('priceChat');
    setTimeout(() => {
        const title = document.getElementById('priceChatTitle');
        if (title) {
            title.textContent = `${productName}价格智能体`;
        }
        
        // 发送初始消息
        if (initialMessage) {
            addPriceChatMessage('user', initialMessage);
            // 模拟AI回复
            setTimeout(() => {
                simulatePriceChatResponse(productName, initialMessage);
            }, 1000);
        }
    }, 100);
}

// 返回价格主页
function goBackToPriceHome() {
    const productName = window.currentPriceProduct || '小麦';
    const pageMap = {
        '小麦': 'wheatPriceAgent',
        '玉米': 'cornPriceAgent',
        '大豆': 'soyPriceAgent'
    };
    loadPage(pageMap[productName] || 'wheatPriceAgent');
}

// 添加价格对话消息
function addPriceChatMessage(sender, content) {
    const container = document.getElementById('priceChatMessages');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-bubble">${content}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-bubble">${content}</div>
        `;
    }
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

// 发送价格对话消息
function sendPriceChatMessage() {
    const input = document.getElementById('priceChatInput');
    const message = input ? input.value.trim() : '';
    
    if (!message) return;
    
    const productName = window.currentPriceProduct || '小麦';
    addPriceChatMessage('user', message);
    input.value = '';
    
    // 模拟AI回复
    setTimeout(() => {
        simulatePriceChatResponse(productName, message);
    }, 1000);
}

// 模拟价格对话响应
function simulatePriceChatResponse(productName, question) {
    const container = document.getElementById('priceChatMessages');
    if (!container) return;
    
    // 添加加载状态
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message ai-message loading';
    loadingDiv.id = 'loading-message';
    loadingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-bubble">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
    
    // 2秒后显示回复
    setTimeout(() => {
        loadingDiv.remove();
        
        let response = '';
        if (question.includes('多少钱') || question.includes('价格')) {
            response = `根据最新市场数据，${productName}的价格情况如下：\n\n📊 当前价格：¥2.65/斤\n📈 涨跌幅：+0.08 (+3.1%)\n🌍 地区：河南\n\n价格分析：受近期降雨天气影响，${productName}价格整体呈现上涨趋势。建议继续关注后续天气变化及市场动态。`;
        } else if (question.includes('趋势') || question.includes('走势')) {
            response = `${productName}最近7天的价格趋势如下：\n\n📈 整体趋势：波动上涨\n📊 7日涨幅：+5.2%\n💡 关键因素：\n  • 降雨影响收购进度\n  • 储备粮轮换启动\n  • 需求稳定增长\n\n预计短期内价格将维持稳中有涨的态势。`;
        } else if (question.includes('适合卖') || question.includes('决策')) {
            response = `根据当前市场情况，我的建议如下：\n\n✅ 建议：适当惜售\n\n📌 理由：\n  1. 当前价格处于阶段性高位\n  2. 后续仍有上涨空间\n  3. 天气因素持续利好\n\n⚠️ 注意事项：\n  • 密切关注天气变化\n  • 留意政策调控信息\n  • 保持与收购方的沟通`;
        } else if (question.includes('预测') || question.includes('未来')) {
            response = `${productName}未来3天价格预测：\n\n📊 预测价格：\n  • 明天：¥2.66-2.68/斤\n  • 后天：¥2.67-2.70/斤\n  • 第3天：¥2.68-2.71/斤\n\n💡 预测依据：\n  • 天气持续影响\n  • 市场需求稳定\n  • 库存水平偏低\n\n建议您根据自身情况合理安排出售时机。`;
        } else {
            response = `感谢您的提问！关于${productName}，我可以为您提供：\n\n📊 实时价格查询\n📈 价格走势分析\n💡 买卖决策建议\n🔮 价格趋势预测\n\n请告诉我您想了解哪方面的信息？`;
        }
        
        addPriceChatMessage('ai', response);
    }, 2000);
}

// 添加价格智能体消息
function addPriceAgentMessage(sender, content, type = 'text') {
    const container = document.getElementById('priceAgentMessages');
    if (!container) return null;
    
    const messageId = 'msg-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = `price-message ${sender}-message`;
    messageDiv.id = messageId;
    
    if (type === 'loading') {
        messageDiv.innerHTML = `
            <div class="message-content loading-message">
                <div class="loading-spinner"></div>
                <span>AI正在分析中...</span>
            </div>
        `;
    } else if (type === 'report') {
        messageDiv.innerHTML = `<div class="message-content report-content">${content}</div>`;
    } else {
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    }
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
    
    return messageId;
}

// 移除消息
function removeMessage(messageId) {
    const msg = document.getElementById(messageId);
    if (msg) msg.remove();
}

// 生成价格日报
function generatePriceDailyReport(productName) {
    const data = priceAgentData[productName];
    if (!data) return;
    
    const changeClass = data.change >= 0 ? 'positive' : 'negative';
    const changeIcon = data.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    const decisionClass = data.decision.type === 'sell' ? 'sell' : data.decision.type === 'buy' ? 'buy' : 'hold';
    
    const reportHTML = `
        <div class="daily-report">
            <!-- 报告标题 -->
            <div class="report-header">
                <h3><i class="fas fa-newspaper"></i> ${productName}价格日报</h3>
                <div class="report-date">${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            
            <!-- 核心数据 -->
            <div class="report-section price-summary">
                <div class="summary-main">
                    <div class="product-info">
                        <span class="product-name">${data.name}</span>
                        <span class="product-region">${data.region}</span>
                    </div>
                    <div class="price-info">
                        <div class="current-price">¥${data.currentPrice}<span class="unit">/斤</span></div>
                        <div class="price-change ${changeClass}">
                            <i class="fas ${changeIcon}"></i>
                            <span>${data.change >= 0 ? '+' : ''}${data.change} (${data.change >= 0 ? '+' : ''}${data.changePercent}%)</span>
                        </div>
                    </div>
                </div>
                <div class="summary-insight">
                    <i class="fas fa-lightbulb"></i>
                    <span>${data.insight}</span>
                </div>
            </div>
            
            <!-- 趋势图表 -->
            <div class="report-section">
                <h4><i class="fas fa-chart-line"></i> 价格走势</h4>
                <div class="chart-wrapper">
                    <canvas id="reportTrendChart" width="320" height="180"></canvas>
                </div>
                <div class="chart-legend">
                    <span class="legend-item"><span class="legend-dot history"></span>历史价格</span>
                    <span class="legend-item"><span class="legend-dot forecast"></span>AI预测</span>
                </div>
            </div>
            
            <!-- 地域对比 -->
            <div class="report-section">
                <h4><i class="fas fa-map-marked-alt"></i> 主要产区价格</h4>
                <div class="region-prices">
                    ${data.regionData.slice(0, 3).map((item, index) => `
                        <div class="region-price-item">
                            <span class="region-rank">${index + 1}</span>
                            <span class="region-name">${item.region}</span>
                            <span class="region-price">¥${item.price}</span>
                            <span class="region-trend ${item.trend}">
                                ${item.trend === 'up' ? '<i class="fas fa-arrow-up"></i>' : 
                                  item.trend === 'down' ? '<i class="fas fa-arrow-down"></i>' : 
                                  '<i class="fas fa-minus"></i>'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- AI建议 -->
            <div class="report-section ai-suggestion ${decisionClass}">
                <h4><i class="fas fa-robot"></i> AI决策建议</h4>
                <div class="suggestion-title">${data.decision.title}</div>
                <div class="suggestion-content">${data.decision.content}</div>
                <div class="suggestion-details">
                    <div class="suggestion-item risks">
                        <strong>风险提示</strong>
                        <ul>
                            ${data.decision.risks.map(risk => `<li>${risk}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="suggestion-item opportunities">
                        <strong>利好因素</strong>
                        <ul>
                            ${data.decision.opportunities.map(opp => `<li>${opp}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- 快捷操作 -->
            <div class="report-actions">
                <button class="action-chip" onclick="switchPriceProduct('小麦')">
                    <i class="fas fa-seedling"></i>
                    <span>小麦</span>
                </button>
                <button class="action-chip" onclick="switchPriceProduct('玉米')">
                    <i class="fas fa-corn"></i>
                    <span>玉米</span>
                </button>
                <button class="action-chip" onclick="switchPriceProduct('大豆')">
                    <i class="fas fa-leaf"></i>
                    <span>大豆</span>
                </button>
            </div>
        </div>
    `;
    
    addPriceAgentMessage('ai', reportHTML, 'report');
    
    // 绘制图表
    setTimeout(() => {
        drawReportTrendChart(data);
    }, 100);
}

// 绘制报告中的趋势图
function drawReportTrendChart(data) {
    const canvas = document.getElementById('reportTrendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const allData = [...data.historyData, ...data.forecastData];
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 计算数据范围
    const prices = allData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    
    // 绘制参数
    const padding = { top: 15, right: 15, bottom: 25, left: 35 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const stepX = chartWidth / (allData.length - 1);
    
    // 绘制网格线
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        
        // 绘制Y轴标签
        const value = (maxPrice - (range / 4) * i).toFixed(2);
        ctx.fillStyle = '#666';
        ctx.font = '9px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('¥' + value, padding.left - 5, y + 3);
    }
    
    // 绘制历史数据线
    ctx.beginPath();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    data.historyData.forEach((point, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + chartHeight - ((point.price - minPrice) / range) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // 绘制预测数据线（虚线）
    ctx.beginPath();
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const historyLen = data.historyData.length;
    data.forecastData.forEach((point, index) => {
        const x = padding.left + (historyLen + index - 1) * stepX;
        const y = padding.top + chartHeight - ((point.price - minPrice) / range) * chartHeight;
        
        if (index === 0) {
            const lastHistory = data.historyData[historyLen - 1];
            const lastX = padding.left + (historyLen - 1) * stepX;
            const lastY = padding.top + chartHeight - ((lastHistory.price - minPrice) / range) * chartHeight;
            ctx.moveTo(lastX, lastY);
        }
        ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 绘制数据点
    allData.forEach((point, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + chartHeight - ((point.price - minPrice) / range) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = index < historyLen ? '#4CAF50' : '#FF9800';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // 绘制X轴标签
    ctx.fillStyle = '#666';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    allData.forEach((point, index) => {
        if (index % 2 === 0 || index === allData.length - 1) {
            const x = padding.left + index * stepX;
            const y = canvas.height - 8;
            ctx.fillText(point.date, x, y);
        }
    });
}

// 切换产品
function switchPriceProduct(productName) {
    const container = document.getElementById('priceAgentMessages');
    if (!container) return;
    
    // 添加用户消息
    addPriceAgentMessage('user', `查看${productName}价格`, 'text');
    
    // 重新进入对应的智能体
    setTimeout(() => {
        enterPriceAgent(productName);
    }, 300);
}

// 发送消息（已废弃，保留兼容性）
function sendPriceAgentMessage() {
    const input = document.getElementById('priceAgentInput');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    input.value = '';
    
    // 添加用户消息
    addPriceAgentMessage('user', message, 'text');
    
    // 模拟AI回复
    setTimeout(() => {
        const loadingId = addPriceAgentMessage('ai', '', 'loading');
        
        setTimeout(() => {
            removeMessage(loadingId);
            addPriceAgentMessage('ai', '感谢您的提问！基于当前市场数据，我的建议是...（此处为演示功能，实际应接入AI对话能力）', 'text');
        }, 1000);
    }, 300);
}

// ==================== 价格AI分析报告相关函数 ====================

// 从首页进入价格报告
function enterPriceReport(productName, region) {
    loadPage('homePriceReport');
    setTimeout(() => {
        initHomePriceReport(productName, region);
    }, 100);
}

// 初始化首页价格报告（显示生成中）
function initHomePriceReport(productName, region) {
    const title = document.getElementById('homePriceReportTitle');
    if (title) {
        title.textContent = `${productName}价格报告`;
    }

    const container = document.getElementById('homePriceReportContent');
    if (!container) return;

    // 如果指定了地区，使用该地区，否则使用默认地区
    const reportRegion = region || (priceAgentData[productName] ? priceAgentData[productName].region : '河南');
    
    // 显示生成中状态
    showHomePriceReportLoading(container, productName, reportRegion);
    
    // 模拟1-2分钟生成，这里用3秒演示
    setTimeout(() => {
        generateHomePriceReportPreview(container, productName, reportRegion);
    }, 3000);
}

// 显示首页报告生成中状态
function showHomePriceReportLoading(container, productName, region) {
    container.innerHTML = `
        <div class="home-report-loading-state">
            <div class="loading-animation-large">
                <div class="loading-spinner-xlarge"></div>
            </div>
            <div class="loading-text-large">
                <h2>正在生成${productName}价格报告</h2>
                <p>预计需要 1-2 分钟，请稍候...</p>
                <p class="loading-tips">AI正在分析市场数据、历史价格趋势、供需关系...</p>
            </div>
            <div class="loading-progress">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">分析中...</div>
            </div>
        </div>
    `;
}

// 生成首页报告预览卡片
function generateHomePriceReportPreview(container, productName, region) {
    const data = priceAgentData[productName];
    if (!data) return;
    
    // 使用传入的地区，如果没有则使用数据中的默认地区
    const displayRegion = region || data.region;
    
    const changeClass = data.change >= 0 ? 'positive' : 'negative';
    const changeIcon = data.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
    // 计算平均价格
    const avgPrice = (data.historyData.reduce((sum, item) => sum + item.price, 0) / data.historyData.length).toFixed(2);
    
    container.innerHTML = `
        <!-- 预览卡片 -->
        <div class="home-report-preview-card" onclick="viewPriceReportDetail('${productName}', '${displayRegion}')">
            <div class="preview-card-badge">
                <i class="fas fa-file-alt"></i>
                <span>AI分析报告</span>
            </div>
            
            <div class="preview-card-header">
                <div class="preview-card-title">
                    <h3>${productName}价格分析报告</h3>
                    <span class="preview-card-date">${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>
            
            <div class="preview-card-body">
                <div class="preview-info-row">
                    <div class="preview-info-item">
                        <span class="info-label">所在城市</span>
                        <span class="info-value">${displayRegion}</span>
                    </div>
                    <div class="preview-info-item">
                        <span class="info-label">种植作物</span>
                        <span class="info-value">${productName}</span>
                    </div>
                </div>
                
                <div class="preview-info-row">
                    <div class="preview-info-item">
                        <span class="info-label">历史数据周期</span>
                        <span class="info-value">2009-2025</span>
                    </div>
                    <div class="preview-info-item">
                        <span class="info-label">生成日期</span>
                        <span class="info-value">${new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}</span>
                    </div>
                </div>
                
                <div class="preview-tags">
                    <span class="preview-tag ${changeClass}">
                        <i class="fas ${changeIcon}"></i>
                        ${data.change >= 0 ? '价格上涨' : '价格下跌'}
                    </span>
                    <span class="preview-tag">
                        <i class="fas fa-chart-line"></i>
                        ${data.change >= 0 ? '短期看涨' : '短期看跌'}
                    </span>
                </div>
                
                <div class="preview-conclusion">
                    <h4>短期预测</h4>
                    <p>${data.shortTermForecast || '预计未来3-5天价格将' + (data.change >= 0 ? '保持上涨态势' : '继续小幅回调') + '，建议密切关注市场动态。'}</p>
                </div>
                
                <div class="preview-price-summary">
                    <div class="price-summary-item">
                        <span class="summary-label">当前价格</span>
                        <span class="summary-value price-current">¥${data.currentPrice}/斤</span>
                    </div>
                    <div class="price-summary-item">
                        <span class="summary-label">平均价格</span>
                        <span class="summary-value">¥${avgPrice}/斤</span>
                    </div>
                    <div class="price-summary-item">
                        <span class="summary-label">涨跌幅度</span>
                        <span class="summary-value ${changeClass}">${data.change >= 0 ? '+' : ''}${data.changePercent}%</span>
                    </div>
                </div>
            </div>
            
            <div class="preview-card-footer">
                <span>点击查看详细报告</span>
                <i class="fas fa-chevron-right"></i>
            </div>
        </div>
        
        <!-- 选择其他地区按钮 -->
        <div class="select-region-btn" onclick="showRegionSelector('${productName}')">
            <i class="fas fa-map-marked-alt"></i>
            <span>选择其他地区，生成AI价格报告</span>
        </div>
        
        <!-- 推荐模块 -->
        <div class="recommended-section">
            <h4>推荐</h4>
            
            <!-- 智能体推荐卡片 -->
            <div class="recommended-agent-card" onclick="event.stopPropagation(); enterPriceAgent('${productName}')">
                <div class="agent-card-icon">
                    <i class="fas ${productName === '小麦' ? 'fa-wheat-awn' : productName === '玉米' ? 'fa-corn' : 'fa-seedling'}"></i>
                </div>
                <div class="agent-card-content">
                    <div class="agent-card-title">${productName}价格智能体</div>
                    <div class="agent-card-desc">实时价格查询、趋势预测、智能对话咨询</div>
                    <div class="agent-card-features">
                        <span><i class="fas fa-check-circle"></i> 智能对话</span>
                        <span><i class="fas fa-check-circle"></i> 实时行情</span>
                        <span><i class="fas fa-check-circle"></i> 专业建议</span>
                    </div>
                </div>
                <div class="agent-card-action">
                    <span>进入咨询</span>
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        </div>
    `;
}

// 存储首页切换的地区信息
let homePriceRegionData = {
    productName: '小麦',
    region: '河南',
    isGenerating: false
};

// 首页切换地区选择器
function showHomeRegionSelector(productName) {
    const regions = wheatMainRegions;
    
    // 创建弹窗HTML
    const modalHTML = `
        <div class="region-selector-modal" id="homeRegionSelectorModal" onclick="closeHomeRegionSelector(event)">
            <div class="region-selector-content" onclick="event.stopPropagation()">
                <div class="region-selector-header">
                    <h3>选择地区</h3>
                    <button class="close-btn" onclick="closeHomeRegionSelector()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="region-selector-body">
                    <div class="region-tabs">
                        ${Object.keys(regions).map((province, index) => `
                            <button class="region-tab ${index === 0 ? 'active' : ''}" 
                                    onclick="switchHomeRegionTab('${province}', '${productName}')" 
                                    data-province="${province}">
                                ${regions[province].name}
                            </button>
                        `).join('')}
                    </div>
                    <div class="region-counties" id="homeRegionCounties">
                        ${generateHomeCountiesList('全国', productName)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到手机内容容器
    const phoneContent = document.getElementById('phoneContent');
    if (!phoneContent) return;
    
    const existingModal = document.getElementById('homeRegionSelectorModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    phoneContent.insertAdjacentHTML('beforeend', modalHTML);
    
    // 添加动画
    setTimeout(() => {
        const modal = document.getElementById('homeRegionSelectorModal');
        if (modal) {
            modal.classList.add('show');
        }
    }, 10);
}

// 生成首页县区列表
function generateHomeCountiesList(province, productName) {
    const regions = wheatMainRegions;
    const counties = regions[province].counties;
    
    if (province === '全国') {
        return `
            <div class="county-item national" onclick="selectHomeRegion('${productName}', '全国', '')">
                <div class="county-icon">
                    <i class="fas fa-globe"></i>
                </div>
                <div class="county-content">
                    <div class="county-name">全国概况</div>
                    <div class="county-desc">查看全国${productName}价格综合分析</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
        `;
    }
    
    return counties.map(county => `
        <div class="county-item" onclick="selectHomeRegion('${productName}', '${province}', '${county}')">
            <div class="county-icon">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="county-content">
                <div class="county-name">${county}</div>
                <div class="county-desc">${province}省${county}地区</div>
            </div>
            <i class="fas fa-chevron-right"></i>
        </div>
    `).join('');
}

// 切换首页地区选项卡
function switchHomeRegionTab(province, productName) {
    // 更新选项卡状态
    document.querySelectorAll('#homeRegionSelectorModal .region-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.province === province) {
            tab.classList.add('active');
        }
    });
    
    // 更新县区列表
    const countiesContainer = document.getElementById('homeRegionCounties');
    if (countiesContainer) {
        countiesContainer.innerHTML = generateHomeCountiesList(province, productName);
    }
}

// 选择首页地区
function selectHomeRegion(productName, province, county) {
    closeHomeRegionSelector();
    
    const region = county ? `${province}-${county}` : province;
    
    // 保存选择的地区信息
    homePriceRegionData = {
        productName: productName,
        region: region,
        province: province,
        county: county,
        isGenerating: true
    };
    
    // 显示生成提示弹窗
    showHomeRegionGeneratingModal(productName, region);
    
    // 模拟生成过程（1-2分钟）
    setTimeout(() => {
        // 生成完成，显示绿色公告
        showHomeRegionNotice(productName, region);
        homePriceRegionData.isGenerating = false;
    }, 120000); // 2分钟
}

// 显示生成提示弹窗
function showHomeRegionGeneratingModal(productName, region) {
    const phoneContent = document.getElementById('phoneContent');
    if (!phoneContent) return;
    
    const modalHTML = `
        <div class="region-generating-modal" id="regionGeneratingModal">
            <div class="generating-content">
                <div class="generating-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="generating-text">
                    <h3>正在生成${productName}价格报告</h3>
                    <p>您选择的${region}地区${productName}价格AI分析报告正在生成中，预计1-2分钟完成，请稍候...</p>
                </div>
                <button class="generating-close-btn" onclick="closeGeneratingModal()">知道了</button>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('regionGeneratingModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    phoneContent.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        const modal = document.getElementById('regionGeneratingModal');
        if (modal) {
            modal.classList.add('show');
        }
    }, 10);
}

// 关闭生成提示弹窗
function closeGeneratingModal() {
    const modal = document.getElementById('regionGeneratingModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 关闭首页地区选择器
function closeHomeRegionSelector(event) {
    if (event && event.target.id === 'homeRegionSelectorModal') {
        const modal = document.getElementById('homeRegionSelectorModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    } else if (!event) {
        const modal = document.getElementById('homeRegionSelectorModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
}

// 显示首页地区切换公告
function showHomeRegionNotice(productName, region) {
    const notice = document.getElementById('priceRegionNotice');
    const noticeText = document.getElementById('priceRegionNoticeText');
    
    if (notice && noticeText) {
        noticeText.textContent = `您选择的${region}地区${productName}价格AI分析报告已生成`;
        notice.style.display = 'flex';
    }
    
    // 更新首页卡片显示的地区
    const regionElement = document.getElementById('homeProductRegion');
    if (regionElement) {
        regionElement.textContent = `${region}地区`;
    }
}

// 查看新地区报告
function viewNewRegionReport() {
    if (homePriceRegionData && homePriceRegionData.region) {
        enterPriceReport(homePriceRegionData.productName, homePriceRegionData.region);
    }
}

// 显示地区选择器弹窗
function showRegionSelector(productName) {
    const regions = wheatMainRegions;
    
    // 创建弹窗HTML
    const modalHTML = `
        <div class="region-selector-modal" id="regionSelectorModal" onclick="closeRegionSelector(event)">
            <div class="region-selector-content" onclick="event.stopPropagation()">
                <div class="region-selector-header">
                    <h3>选择地区</h3>
                    <button class="close-btn" onclick="closeRegionSelector()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="region-selector-body">
                    <div class="region-tabs">
                        ${Object.keys(regions).map((province, index) => `
                            <button class="region-tab ${index === 0 ? 'active' : ''}" 
                                    onclick="switchRegionTab('${province}')" 
                                    data-province="${province}">
                                ${regions[province].name}
                            </button>
                        `).join('')}
                    </div>
                    <div class="region-counties" id="regionCounties">
                        ${generateCountiesList('全国', productName)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到手机内容容器
    const phoneContent = document.getElementById('phoneContent');
    if (!phoneContent) return;
    
    const existingModal = document.getElementById('regionSelectorModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    phoneContent.insertAdjacentHTML('beforeend', modalHTML);
    
    // 添加动画
    setTimeout(() => {
        const modal = document.getElementById('regionSelectorModal');
        if (modal) {
            modal.classList.add('show');
        }
    }, 10);
}

// 生成县区列表
function generateCountiesList(province, productName) {
    const regions = wheatMainRegions;
    const counties = regions[province].counties;
    
    if (province === '全国') {
        return `
            <div class="county-item national" onclick="viewRegionPriceReport('${productName}', '全国', '')">
                <div class="county-icon">
                    <i class="fas fa-globe"></i>
                </div>
                <div class="county-content">
                    <div class="county-name">全国概况</div>
                    <div class="county-desc">查看全国${productName}价格综合分析</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
        `;
    }
    
    return counties.map(county => `
        <div class="county-item" onclick="viewRegionPriceReport('${productName}', '${province}', '${county}')">
            <div class="county-icon">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="county-content">
                <div class="county-name">${county}</div>
                <div class="county-desc">${province}省${county}地区</div>
            </div>
            <i class="fas fa-chevron-right"></i>
        </div>
    `).join('');
}

// 切换地区选项卡
function switchRegionTab(province) {
    // 更新选项卡状态
    document.querySelectorAll('.region-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.province === province) {
            tab.classList.add('active');
        }
    });
    
    // 更新县区列表
    const countiesContainer = document.getElementById('regionCounties');
    if (countiesContainer) {
        const productName = '小麦'; // 这里可以从上下文获取
        countiesContainer.innerHTML = generateCountiesList(province, productName);
    }
}

// 查看指定地区的价格报告
function viewRegionPriceReport(productName, province, county) {
    closeRegionSelector();
    const region = county ? `${province}-${county}` : province;
    viewPriceReportDetail(productName, region);
}

// 关闭地区选择器
function closeRegionSelector(event) {
    const modal = document.getElementById('regionSelectorModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 查看价格报告详情
function viewPriceReportDetail(productName, region) {
    loadPriceReportPage(productName, region);
}

// 加载价格报告详情页面
function loadPriceReportPage(productName, region, question = '') {
    loadPage('priceReport');
    setTimeout(() => {
        initPriceReport(productName, region, question);
    }, 100);
}

// 初始化价格报告
function initPriceReport(productName, region, question = '') {
    console.log('initPriceReport called:', productName, region);
    
    const title = document.getElementById('priceReportTitle');
    if (title) {
        title.textContent = `${productName}价格AI分析报告`;
    }
    
    const container = document.getElementById('priceReportContent');
    if (!container) {
        console.error('价格报告容器未找到');
        return;
    }
    
    console.log('开始生成价格报告...');
    // 直接显示完整报告，不显示加载状态
    generatePriceAnalysisReport(container, productName, region);
    console.log('价格报告生成完成');
}

// 显示价格报告加载状态
function showPriceReportLoading(container, productName) {
    container.innerHTML = `
        <div class="report-loading-state">
            <div class="loading-animation">
                <div class="loading-spinner-large"></div>
            </div>
            <div class="loading-text">
                <h3>正在生成${productName}价格AI分析报告</h3>
                <p>AI正在分析市场数据、价格趋势、供需关系...</p>
            </div>
        </div>
    `;
}

// 生成价格AI分析报告
function generatePriceAnalysisReport(container, productName, region) {
    console.log('generatePriceAnalysisReport called:', productName, region);
    
    const data = priceAgentData[productName];
    if (!data) {
        console.error('未找到产品数据:', productName);
        container.innerHTML = '<div style="padding:20px;text-align:center;">未找到产品数据</div>';
        return;
    }
    
    // 保存当前报告数据用于分享
    currentPriceReportData = {
        productName: productName,
        region: region,
        ...data
    };
    
    console.log('产品数据:', data);
    console.log('AI建议数据:', data.aiAdvice);
    
    const changeClass = data.change >= 0 ? 'positive' : 'negative';
    const changeIcon = data.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    const decisionClass = data.decision && data.decision.type ? (data.decision.type === 'sell' ? 'sell' : data.decision.type === 'buy' ? 'buy' : 'hold') : 'hold';
    
    // 获取地区数据
    const regionData = data.regionData || [];
    const availableRegions = regionData.map(r => r.region);
    
    container.innerHTML = `
        <!-- 预览卡片 -->
        <div class="price-report-preview-card">
            <div class="preview-header">
                <div class="preview-title-section">
                    <h2><i class="fas fa-file-alt"></i> ${productName}价格日报</h2>
                    <div class="preview-date">${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div class="preview-region-display">
                    <span class="region-tag">${data.region}</span>
                </div>
            </div>
            
            <div class="preview-body">
                <!-- 核心价格信息 -->
                <div class="price-core-section">
                    <div class="price-main-info">
                        <div class="product-label">
                            <span class="product-name">${data.name}</span>
                        </div>
                        <div class="price-value-section">
                            <div class="current-price-large">¥${data.currentPrice}<span class="unit">/斤</span></div>
                            <div class="price-change-large price-up">
                                <span class="change-prefix">较前一天</span>
                                <i class="fas ${changeIcon}"></i>
                                <span class="change-value">${data.change >= 0 ? '+' : ''}${data.change}</span>
                                <span class="change-percent">(${data.change >= 0 ? '+' : ''}${data.changePercent}%)</span>
                            </div>
                        </div>
                    </div>
                    <div class="price-insight-banner">
                        <i class="fas fa-lightbulb"></i>
                        <span>${data.insight}</span>
                    </div>
                </div>
                
                <!-- 价格趋势图 -->
                <div class="report-chart-section">
                    <h4><i class="fas fa-chart-line"></i> 价格趋势</h4>
                    <div class="chart-container">
                        <canvas id="priceReportTrendChart" width="360" height="200"></canvas>
                    </div>
                    <div class="chart-legend">
                        <span class="legend-item"><span class="legend-dot history"></span>历史价格</span>
                    </div>
                    <div class="chart-summary">
                        <div class="summary-item">
                            <span class="label">7日均价</span>
                            <span class="value">¥${(data.historyData.reduce((sum, item) => sum + item.price, 0) / data.historyData.length).toFixed(2)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">最高价</span>
                            <span class="value">¥${Math.max(...data.historyData.map(item => item.price)).toFixed(2)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">最低价</span>
                            <span class="value">¥${Math.min(...data.historyData.map(item => item.price)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 主要产区价格对比 -->
                <div class="report-region-section">
                    <h4><i class="fas fa-map-marked-alt"></i> 主要产区价格对比</h4>
                    <div class="region-price-list">
                        ${data.regionData.map((item, index) => `
                            <div class="region-price-row">
                                <div class="region-info">
                                    <span class="region-rank">#${index + 1}</span>
                                    <span class="region-name">${item.region}</span>
                                </div>
                                <div class="region-value">
                                    <span class="region-price">¥${item.price}</span>
                                    <span class="region-trend-icon ${item.trend}">
                                        ${item.trend === 'up' ? '<i class="fas fa-arrow-up"></i> 上涨' : 
                                          item.trend === 'down' ? '<i class="fas fa-arrow-down"></i> 下跌' : 
                                          '<i class="fas fa-minus"></i> 持平'}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- 市场分析 -->
                <div class="report-analysis-section">
                    <h4><i class="fas fa-chart-bar"></i> 市场分析</h4>
                    <div class="analysis-grid">
                        <div class="analysis-card">
                            <div class="analysis-label">供应情况</div>
                            <div class="analysis-value">充足</div>
                            <div class="analysis-desc">当前市场供应稳定，库存充裕</div>
                        </div>
                        <div class="analysis-card">
                            <div class="analysis-label">需求情况</div>
                            <div class="analysis-value">旺盛</div>
                            <div class="analysis-desc">春节前备货需求增加</div>
                        </div>
                        <div class="analysis-card">
                            <div class="analysis-label">运输状况</div>
                            <div class="analysis-value">正常</div>
                            <div class="analysis-desc">物流运输畅通</div>
                        </div>
                        <div class="analysis-card">
                            <div class="analysis-label">政策影响</div>
                            <div class="analysis-value">利好</div>
                            <div class="analysis-desc">国家收储政策支持</div>
                        </div>
                    </div>
                </div>
                
                <!-- AI建议 -->
                <div class="report-ai-advice-section">
                    <h4><i class="fas fa-robot"></i> AI建议</h4>
                    
                    <div class="ai-advice-summary">
                        <div class="advice-trend-badge trend-${data.aiAdvice && data.aiAdvice.trend ? data.aiAdvice.trend : 'stable'}">
                            <i class="fas ${data.aiAdvice && data.aiAdvice.trend === 'up' ? 'fa-arrow-up' : data.aiAdvice && data.aiAdvice.trend === 'down' ? 'fa-arrow-down' : 'fa-minus'}"></i>
                            ${data.aiAdvice && data.aiAdvice.summary ? data.aiAdvice.summary : '价格平稳运行'}
                        </div>
                    </div>
                    
                    <div class="ai-advice-details">
                        ${(data.aiAdvice && data.aiAdvice.details ? data.aiAdvice.details : []).map(detail => `
                            <div class="advice-detail-item">
                                <i class="fas fa-circle"></i>
                                <span>${detail}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="decision-details-grid">
                        <div class="decision-detail-card risks">
                            <h5><i class="fas fa-exclamation-triangle"></i> 风险因素</h5>
                            <ul>
                                ${(data.aiAdvice && data.aiAdvice.risks ? data.aiAdvice.risks : []).map(risk => `<li>${risk}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="decision-detail-card opportunities">
                            <h5><i class="fas fa-check-circle"></i> 利好因素</h5>
                            <ul>
                                ${(data.aiAdvice && data.aiAdvice.opportunities ? data.aiAdvice.opportunities : []).map(opp => `<li>${opp}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <!-- 免责声明 -->
                    <div class="disclaimer-notice">
                        <i class="fas fa-info-circle"></i>
                        <span>以上分析基于AI数据分析和市场洞察，仅供参考，不构成投资建议。市场价格受多种因素影响，实际交易请结合当地市场情况谨慎决策。</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 显示分享按钮
    const shareBtn = document.getElementById('priceReportShareBtn');
    if (shareBtn) {
        shareBtn.style.display = 'block';
    }
    
    // 绘制图表
    setTimeout(() => {
        drawPriceReportChart(data);
    }, 100);
}

// 绘制价格报告图表
function drawPriceReportChart(data) {
    const canvas = document.getElementById('priceReportTrendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    // 只使用历史数据，不使用预测数据
    const allData = data.historyData;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 计算数据范围
    const prices = allData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    
    // 绘制参数
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const stepX = chartWidth / (allData.length - 1);
    
    // 绘制网格线
    ctx.strokeStyle = '#E8E8E8';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        
        // 绘制Y轴标签
        const value = (maxPrice - (range / 4) * i).toFixed(2);
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('¥' + value, padding.left - 5, y + 3);
    }
    
    // 绘制历史数据线
    ctx.beginPath();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    
    data.historyData.forEach((point, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + chartHeight - ((point.price - minPrice) / range) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // 只绘制历史数据点，不绘制预测数据
    ctx.setLineDash([]);
    data.historyData.forEach((point, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + chartHeight - ((point.price - minPrice) / range) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#4CAF50';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // 绘制X轴标签（每隔一个显示）
    ctx.fillStyle = '#666';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    allData.forEach((point, index) => {
        if (index % 2 === 0 || index === allData.length - 1) {
            const x = padding.left + index * stepX;
            const y = padding.top + chartHeight + 15;
            ctx.fillText(point.date, x, y);
        }
    });
}

// 切换价格地区
function switchPriceRegion(productName, region) {
    // 重新加载报告
    initPriceReport(productName, region);
}

// ==================== 历史价格查询模块 ====================

// 历史价格数据（模拟数据，实际应从后端获取）
const historicalPriceData = {
    '河南省': {
        '郑州市': {
            '新郑市': [
                { year: 2020, cate: '小麦', breed: '白麦', avgPrice: 1.5, unit: '斤', date: '2020-12-22' },
                { year: 2020, cate: '小麦', breed: '白麦', avgPrice: 1.48, unit: '斤', date: '2020-06-15' },
                { year: 2021, cate: '小麦', breed: '白麦', avgPrice: 1.65, unit: '斤', date: '2021-12-20' },
                { year: 2022, cate: '小麦', breed: '白麦', avgPrice: 1.72, unit: '斤', date: '2022-12-18' },
                { year: 2023, cate: '小麦', breed: '白麦', avgPrice: 1.58, unit: '斤', date: '2023-12-15' },
                { year: 2024, cate: '小麦', breed: '白麦', avgPrice: 1.68, unit: '斤', date: '2024-12-20' },
                { year: 2025, cate: '小麦', breed: '白麦', avgPrice: 2.65, unit: '斤', date: '2025-01-12' }
            ],
            '中牟县': [
                { year: 2020, cate: '小麦', breed: '白麦', avgPrice: 1.52, unit: '斤', date: '2020-12-22' },
                { year: 2021, cate: '小麦', breed: '白麦', avgPrice: 1.67, unit: '斤', date: '2021-12-20' },
                { year: 2022, cate: '小麦', breed: '白麦', avgPrice: 1.75, unit: '斤', date: '2022-12-18' },
                { year: 2023, cate: '小麦', breed: '白麦', avgPrice: 1.60, unit: '斤', date: '2023-12-15' },
                { year: 2024, cate: '小麦', breed: '白麦', avgPrice: 1.70, unit: '斤', date: '2024-12-20' }
            ]
        },
        '开封市': {
            '兰考县': [
                { year: 2020, cate: '小麦', breed: '白麦', avgPrice: 1.49, unit: '斤', date: '2020-12-22' },
                { year: 2021, cate: '小麦', breed: '白麦', avgPrice: 1.63, unit: '斤', date: '2021-12-20' },
                { year: 2022, cate: '小麦', breed: '白麦', avgPrice: 1.70, unit: '斤', date: '2022-12-18' },
                { year: 2023, cate: '小麦', breed: '白麦', avgPrice: 1.56, unit: '斤', date: '2023-12-15' },
                { year: 2024, cate: '小麦', breed: '白麦', avgPrice: 1.66, unit: '斤', date: '2024-12-20' }
            ]
        }
    },
    '山东省': {
        '济南市': {
            '章丘区': [
                { year: 2020, cate: '小麦', breed: '白麦', avgPrice: 1.53, unit: '斤', date: '2020-12-22' },
                { year: 2021, cate: '小麦', breed: '白麦', avgPrice: 1.68, unit: '斤', date: '2021-12-20' },
                { year: 2022, cate: '小麦', breed: '白麦', avgPrice: 1.76, unit: '斤', date: '2022-12-18' },
                { year: 2023, cate: '小麦', breed: '白麦', avgPrice: 1.62, unit: '斤', date: '2023-12-15' },
                { year: 2024, cate: '小麦', breed: '白麦', avgPrice: 1.72, unit: '斤', date: '2024-12-20' }
            ]
        }
    },
    '河北省': {
        '石家庄市': {
            '藁城区': [
                { year: 2020, cate: '小麦', breed: '白麦', avgPrice: 1.51, unit: '斤', date: '2020-12-22' },
                { year: 2021, cate: '小麦', breed: '白麦', avgPrice: 1.66, unit: '斤', date: '2021-12-20' },
                { year: 2022, cate: '小麦', breed: '白麦', avgPrice: 1.73, unit: '斤', date: '2022-12-18' },
                { year: 2023, cate: '小麦', breed: '白麦', avgPrice: 1.59, unit: '斤', date: '2023-12-15' },
                { year: 2024, cate: '小麦', breed: '白麦', avgPrice: 1.69, unit: '斤', date: '2024-12-20' }
            ]
        }
    }
};

// 地区级联数据
const regionCascadeData = {
    '河南省': {
        '郑州市': ['新郑市', '中牟县', '登封市', '荥阳市'],
        '开封市': ['兰考县', '杞县', '尉氏县', '通许县'],
        '洛阳市': ['偃师区', '孟津区', '新安县', '伊川县']
    },
    '山东省': {
        '济南市': ['章丘区', '长清区', '平阴县', '商河县'],
        '青岛市': ['即墨区', '胶州市', '平度市', '莱西市']
    },
    '河北省': {
        '石家庄市': ['藁城区', '栾城区', '正定县', '赵县'],
        '保定市': ['涞水县', '涞源县', '定兴县', '高碑店市']
    }
};

// 加载价格查询页面
function loadPriceQueryPage(productName) {
    loadPage('priceQuery');
    setTimeout(() => {
        initPriceQueryPage(productName);
    }, 100);
}

// 初始化价格查询页面
function initPriceQueryPage(productName) {
    const title = document.getElementById('priceQueryTitle');
    if (title) {
        title.textContent = `${productName}历史价格查询`;
    }
}

// 更新城市选项
function updateCityOptions() {
    const provinceSelect = document.getElementById('provinceSelect');
    const citySelect = document.getElementById('citySelect');
    const countySelect = document.getElementById('countySelect');
    
    const province = provinceSelect.value;
    
    // 清空城市和区县选择
    citySelect.innerHTML = '<option value="">选择城市</option>';
    countySelect.innerHTML = '<option value="">选择区县</option>';
    
    if (province && regionCascadeData[province]) {
        const cities = Object.keys(regionCascadeData[province]);
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

// 更新区县选项
function updateCountyOptions() {
    const provinceSelect = document.getElementById('provinceSelect');
    const citySelect = document.getElementById('citySelect');
    const countySelect = document.getElementById('countySelect');
    
    const province = provinceSelect.value;
    const city = citySelect.value;
    
    // 清空区县选择
    countySelect.innerHTML = '<option value="">选择区县</option>';
    
    if (province && city && regionCascadeData[province] && regionCascadeData[province][city]) {
        const counties = regionCascadeData[province][city];
        counties.forEach(county => {
            const option = document.createElement('option');
            option.value = county;
            option.textContent = county;
            countySelect.appendChild(option);
        });
    }
}

// 切换查询类型
function switchQueryType(type) {
    const tabs = document.querySelectorAll('.query-type-tab');
    const forms = document.querySelectorAll('.query-form-item');
    
    tabs.forEach(tab => {
        if (tab.getAttribute('data-type') === type) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    if (type === 'single') {
        document.getElementById('singleQueryForm').classList.add('active');
        document.getElementById('trendQueryForm').classList.remove('active');
    } else {
        document.getElementById('singleQueryForm').classList.remove('active');
        document.getElementById('trendQueryForm').classList.add('active');
    }
}

// 执行价格查询
function executePriceQuery() {
    const provinceSelect = document.getElementById('provinceSelect');
    const citySelect = document.getElementById('citySelect');
    const countySelect = document.getElementById('countySelect');
    
    const province = provinceSelect.value;
    const city = citySelect.value;
    const county = countySelect.value;
    
    if (!province || !city || !county) {
        showNotification('请选择完整的地区信息', 'warning');
        return;
    }
    
    const activeTab = document.querySelector('.query-type-tab.active');
    const queryType = activeTab.getAttribute('data-type');
    
    if (queryType === 'single') {
        const yearSelect = document.getElementById('yearSelect');
        const year = yearSelect.value;
        
        if (!year) {
            showNotification('请选择查询年份', 'warning');
            return;
        }
        
        executeSingleYearQuery(province, city, county, year);
    } else {
        const startYearSelect = document.getElementById('startYearSelect');
        const endYearSelect = document.getElementById('endYearSelect');
        const startYear = startYearSelect.value;
        const endYear = endYearSelect.value;
        
        if (!startYear || !endYear) {
            showNotification('请选择年份范围', 'warning');
            return;
        }
        
        if (parseInt(startYear) > parseInt(endYear)) {
            showNotification('起始年份不能大于结束年份', 'warning');
            return;
        }
        
        executeTrendQuery(province, city, county, startYear, endYear);
    }
}

// 执行单年查询
function executeSingleYearQuery(province, city, county, year) {
    const resultSection = document.getElementById('queryResultSection');
    const resultContent = document.getElementById('queryResultContent');
    
    // 显示加载状态
    resultSection.style.display = 'block';
    resultContent.innerHTML = '<div class="query-loading"><div class="loading-spinner-large"></div><p>正在查询数据...</p></div>';
    
    // 滚动到结果区域
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        const data = getHistoricalPrice(province, city, county, year);
        
        if (!data) {
            resultContent.innerHTML = `
                <div class="query-empty">
                    <i class="fas fa-inbox"></i>
                    <p>未找到 ${year} 年 ${province}${city}${county} 的价格数据</p>
                    <button class="btn-secondary" onclick="document.getElementById('queryResultSection').style.display='none'">重新查询</button>
                </div>
            `;
            return;
        }
        
        renderSingleYearResult(data, province, city, county, year);
    }, 800);
}

// 执行趋势查询
function executeTrendQuery(province, city, county, startYear, endYear) {
    const resultSection = document.getElementById('queryResultSection');
    const resultContent = document.getElementById('queryResultContent');
    
    // 显示加载状态
    resultSection.style.display = 'block';
    resultContent.innerHTML = '<div class="query-loading"><div class="loading-spinner-large"></div><p>正在分析数据...</p></div>';
    
    // 滚动到结果区域
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        const dataList = getHistoricalPriceRange(province, city, county, parseInt(startYear), parseInt(endYear));
        
        if (!dataList || dataList.length === 0) {
            resultContent.innerHTML = `
                <div class="query-empty">
                    <i class="fas fa-inbox"></i>
                    <p>未找到 ${startYear}-${endYear} 年 ${province}${city}${county} 的价格数据</p>
                    <button class="btn-secondary" onclick="document.getElementById('queryResultSection').style.display='none'">重新查询</button>
                </div>
            `;
            return;
        }
        
        renderTrendResult(dataList, province, city, county, startYear, endYear);
    }, 1200);
}

// 获取历史价格数据
function getHistoricalPrice(province, city, county, year) {
    if (!historicalPriceData[province] || !historicalPriceData[province][city] || !historicalPriceData[province][city][county]) {
        return null;
    }
    
    const countyData = historicalPriceData[province][city][county];
    return countyData.find(item => item.year === parseInt(year));
}

// 获取历史价格范围数据
function getHistoricalPriceRange(province, city, county, startYear, endYear) {
    if (!historicalPriceData[province] || !historicalPriceData[province][city] || !historicalPriceData[province][city][county]) {
        return [];
    }
    
    const countyData = historicalPriceData[province][city][county];
    return countyData.filter(item => item.year >= startYear && item.year <= endYear).sort((a, b) => a.year - b.year);
}

// 渲染单年查询结果
function renderSingleYearResult(data, province, city, county, year) {
    const resultContent = document.getElementById('queryResultContent');
    
    resultContent.innerHTML = `
        <div class="single-year-result">
            <div class="result-header">
                <div class="result-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${province} ${city} ${county}</span>
                </div>
                <div class="result-year">${year}年</div>
            </div>
            
            <div class="result-price-card">
                <div class="price-label">平均价格</div>
                <div class="price-value">
                    <span class="price-number">¥${data.avgPrice.toFixed(2)}</span>
                    <span class="price-unit">/${data.unit}</span>
                </div>
                <div class="price-info">
                    <span class="info-item"><i class="fas fa-seedling"></i> ${data.cate}</span>
                    <span class="info-item"><i class="fas fa-tag"></i> ${data.breed}</span>
                    <span class="info-item"><i class="fas fa-calendar"></i> ${data.date}</span>
                </div>
            </div>
            
            <div class="result-actions">
                <button class="btn-primary" onclick="compareWithOtherYears('${province}', '${city}', '${county}', ${year})">
                    <i class="fas fa-chart-line"></i>
                    查看多年趋势
                </button>
            </div>
        </div>
    `;
}

// 渲染趋势查询结果
function renderTrendResult(dataList, province, city, county, startYear, endYear) {
    const resultContent = document.getElementById('queryResultContent');
    
    // 计算价格变化
    const firstPrice = dataList[0].avgPrice;
    const lastPrice = dataList[dataList.length - 1].avgPrice;
    const priceChange = lastPrice - firstPrice;
    const changePercent = ((priceChange / firstPrice) * 100).toFixed(2);
    const changeClass = priceChange >= 0 ? 'positive' : 'negative';
    const changeIcon = priceChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    
    // 计算平均价格
    const avgPrice = (dataList.reduce((sum, item) => sum + item.avgPrice, 0) / dataList.length).toFixed(2);
    
    // 计算最高价和最低价
    const maxPrice = Math.max(...dataList.map(item => item.avgPrice)).toFixed(2);
    const minPrice = Math.min(...dataList.map(item => item.avgPrice)).toFixed(2);
    
    resultContent.innerHTML = `
        <div class="trend-result">
            <div class="result-header">
                <div class="result-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${province} ${city} ${county}</span>
                </div>
                <div class="result-period">${startYear}-${endYear}年</div>
            </div>
            
            <div class="trend-summary">
                <div class="summary-card">
                    <div class="summary-label">期间平均价</div>
                    <div class="summary-value">¥${avgPrice}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">最高价</div>
                    <div class="summary-value">¥${maxPrice}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">最低价</div>
                    <div class="summary-value">¥${minPrice}</div>
                </div>
                <div class="summary-card ${changeClass}">
                    <div class="summary-label">总体变化</div>
                    <div class="summary-value">
                        <i class="fas ${changeIcon}"></i>
                        ${changePercent}%
                    </div>
                </div>
            </div>
            
            <div class="trend-chart-container">
                <h4><i class="fas fa-chart-line"></i> 价格走势</h4>
                <canvas id="trendChart" width="360" height="220"></canvas>
            </div>
            
            <div class="trend-data-list">
                <h4><i class="fas fa-list"></i> 详细数据</h4>
                <div class="data-table">
                    ${dataList.map((item, index) => {
                        const prevPrice = index > 0 ? dataList[index - 1].avgPrice : item.avgPrice;
                        const yearChange = item.avgPrice - prevPrice;
                        const yearChangePercent = index > 0 ? ((yearChange / prevPrice) * 100).toFixed(2) : '0.00';
                        const yearChangeClass = yearChange >= 0 ? 'positive' : 'negative';
                        const yearChangeIcon = yearChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                        
                        return `
                            <div class="data-row">
                                <div class="row-year">${item.year}年</div>
                                <div class="row-price">¥${item.avgPrice.toFixed(2)}</div>
                                <div class="row-change ${yearChangeClass}">
                                    ${index > 0 ? `<i class="fas ${yearChangeIcon}"></i> ${yearChangePercent}%` : '-'}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    // 绘制趋势图表
    setTimeout(() => {
        drawTrendChart(dataList);
    }, 100);
}

// 绘制趋势图表
function drawTrendChart(dataList) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 计算数据范围
    const prices = dataList.map(d => d.avgPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const paddingValue = range * 0.1; // 10% padding
    
    // 绘制参数
    const padding = { top: 30, right: 30, bottom: 40, left: 50 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const stepX = chartWidth / (dataList.length - 1);
    
    // 绘制标题
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('价格走势图', canvas.width / 2, 20);
    
    // 绘制网格线和Y轴标签
    ctx.strokeStyle = '#E8E8E8';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        const value = (maxPrice + paddingValue - ((range + paddingValue * 2) / 5) * i).toFixed(2);
        
        // 网格线
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        
        // Y轴标签
        ctx.fillText('¥' + value, padding.left - 5, y + 4);
    }
    
    // 绘制价格曲线
    ctx.beginPath();
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    
    dataList.forEach((point, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + chartHeight - ((point.avgPrice - (minPrice - paddingValue)) / (range + paddingValue * 2)) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // 绘制数据点
    dataList.forEach((point, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + chartHeight - ((point.avgPrice - (minPrice - paddingValue)) / (range + paddingValue * 2)) * chartHeight;
        
        // 数据点
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#667eea';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 数据标签（在点上方显示）
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¥' + point.avgPrice.toFixed(2), x, y - 10);
    });
    
    // 绘制X轴标签
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    dataList.forEach((point, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + chartHeight + 20;
        ctx.fillText(point.year + '年', x, y);
    });
}

// 对比其他年份
function compareWithOtherYears(province, city, county, currentYear) {
    // 获取前后各2年的数据
    const startYear = parseInt(currentYear) - 2;
    const endYear = parseInt(currentYear) + 2;
    
    // 切换到趋势查询模式
    switchQueryType('trend');
    
    // 设置年份范围
    document.getElementById('startYearSelect').value = startYear.toString();
    document.getElementById('endYearSelect').value = endYear.toString();
    
    // 执行查询
    executeTrendQuery(province, city, county, startYear.toString(), endYear.toString());
}
