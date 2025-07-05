// 这是主 JS 文件，添加交互逻辑

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const arrowBtn = document.getElementById('sidebarArrow');

    // 初始状态：确保侧边栏是收起的，并且 body 带有相应的 class
    if (sidebar) {
        sidebar.classList.add('closed'); // 确保侧边栏默认是关闭的
    }
    if (document.body) {
        document.body.classList.add('sidebar-closed-active'); // 确保 body 拥有此 class，控制箭头位置
    }

    // 侧边栏展开/收起逻辑（右侧中间箭头）
    if (sidebar && arrowBtn) {
        arrowBtn.addEventListener('click', function () {
            sidebar.classList.toggle('closed');
            document.body.classList.toggle('sidebar-closed-active');
        });
    }

    // 分类展开逻辑
    const headers = document.querySelectorAll('.category-header');
    headers.forEach(header => {
        header.addEventListener('click', function () {
            const articleList = this.nextElementSibling;
            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                articleList.style.display = 'block';
            } else {
                articleList.style.display = 'none';
            }
        });
    });

    // 文章链接点击逻辑
    const articleLinks = document.querySelectorAll('.sidebar-link[data-article]');
    articleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // 阻止链接默认行为
            const articleId = this.getAttribute('data-article');
            
            // 移除了自动收起侧边栏的代码：
            // if (sidebar) {
            //     sidebar.classList.add('closed');
            //     document.body.classList.add('sidebar-closed-active');
            // }

            // 显示文章
            showArticle(articleId);
            
            // 更新侧边栏链接的激活状态
            articleLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // 确保父级分类是展开的
            const parentCategoryHeader = this.closest('.sidebar-category').querySelector('.category-header');
            const parentArticleList = this.closest('.article-list');
            if (parentCategoryHeader && parentArticleList) {
                parentCategoryHeader.classList.add('active');
                parentArticleList.style.display = 'block';
            }
        });
    });

    // 用于管理和显示文章内容区域的函数
    function showArticle(articleId) {
        let contentArea = document.getElementById('contentArea');

        // 如果 contentArea 不存在，就动态创建它并添加到页面中
        if (!contentArea) {
            contentArea = document.createElement('main');
            contentArea.id = 'contentArea'; // 确保 ID 为 'contentArea' 以匹配 CSS
            contentArea.classList.add('content-area');
            // 将 contentArea 添加到 sidebar 后面，这样在 DOM 结构上它们是兄弟元素，方便 CSS 布局
            // 使用 document.body.appendChild(contentArea) 作为通用 fallback
            const sidebarElement = document.getElementById('sidebar');
            if (sidebarElement && sidebarElement.parentNode) {
                sidebarElement.parentNode.insertBefore(contentArea, sidebarElement.nextSibling); 
            } else {
                document.body.appendChild(contentArea); 
            }
        }

        // 清除 contentArea 内的现有内容，以便加载新文章
        contentArea.innerHTML = ''; 

        // 加载新的文章内容
        loadArticleContent(articleId, contentArea);
    }

    // 用于加载文章内容到动态创建的 contentArea 中的函数
    function loadArticleContent(articleId, contentAreaElement) {
        // 定义文章ID到文件路径的映射，或直接提供硬编码的HTML
        const fileMap = {
            'html': 'pages/Html.html',
        };
        const contentSource = fileMap[articleId];

        if (contentSource) {
            if (articleId === 'welcome') {
                // 如果是欢迎消息，直接设置 innerHTML
                contentAreaElement.innerHTML = contentSource;
            } else {
                // 对于其他文章，从 HTML 文件加载
                fetch(contentSource)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('文件未找到: ' + contentSource + ' (HTTP ' + response.status + ')');
                        }
                        return response.text();
                    })
                    .then(html => {
                        // 创建一个临时 div 来解析获取到的 HTML
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;

                        // 查找实际内容，可能在 body 标签内，否则取全部内容
                        const articleDiv = document.createElement('div');
                        articleDiv.classList.add('article-content'); // 为新创建的文章内容 div 添加 active 类

                        const bodyMatch = tempDiv.querySelector('body');
                        if (bodyMatch) {
                            articleDiv.innerHTML = bodyMatch.innerHTML;
                        } else {
                            // 如果没有 body 标签，直接使用 tempDiv 的全部内容
                            articleDiv.innerHTML = tempDiv.innerHTML;
                        }
                        
                        contentAreaElement.appendChild(articleDiv); // 将新创建的文章内容 div 添加到 contentArea
                    })
                    .catch(error => {
                        console.error('加载文章失败:', error);
                        const errorDiv = document.createElement('div');
                        errorDiv.classList.add('article-content');
                        errorDiv.innerHTML = '<p style="color: #ef4444;">抱歉，无法加载此文章内容。<br>' + error.message + '</p>';
                        contentAreaElement.appendChild(errorDiv);
                    });
            }
        }
    }

    // 页面首次加载时不再自动显示文章，只有在用户点击后才显示。
    // 但是为了确保侧边栏的箭头一开始就显示在正确的位置，DOMContentLoaded中已经设置了body的class。
});
