// 这是主 JS 文件，可以在这里添加交互逻辑
// 例如：后续可为侧边栏、文章等添加动态效果

document.addEventListener('DOMContentLoaded', function () {
    // 移除默认展开所有分类的代码

    // 分类展开逻辑（允许多个同时展开）
    const headers = document.querySelectorAll('.category-header');
    headers.forEach(header => {
        header.addEventListener('click', function () {
            const articleList = this.nextElementSibling;
            const isOpen = articleList.style.display === 'block';
            if (isOpen) {
                articleList.style.display = 'none';
                this.classList.remove('active');
            } else {
                articleList.style.display = 'block';
                this.classList.add('active');
            }
        });
    });

    // 侧边栏展开/收起逻辑（右侧中间箭头）
    const sidebar = document.getElementById('sidebar');
    const arrowBtn = document.getElementById('sidebarArrow');
    if (sidebar && arrowBtn) {
        arrowBtn.addEventListener('click', function () {
            sidebar.classList.toggle('closed');
        });
    }

    // 文章链接点击逻辑
    const articleLinks = document.querySelectorAll('.sidebar-link[data-article]');
    articleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const articleId = this.getAttribute('data-article');
            showArticle(articleId);
            
            // 移除其他链接的active状态
            articleLinks.forEach(l => l.classList.remove('active'));
            // 添加当前链接的active状态
            this.classList.add('active');
        });
    });
});

// 显示文章内容的函数
function showArticle(articleId) {
    // 隐藏所有内容
    const allContents = document.querySelectorAll('.article-content');
    allContents.forEach(content => content.classList.remove('active'));
    
    // 显示指定文章内容
    const targetContent = document.getElementById(articleId + 'Content');
    if (targetContent) {
        targetContent.classList.add('active');
        
        // 如果内容为空，加载对应的HTML文件内容
        if (targetContent.innerHTML.trim() === '' || targetContent.innerHTML.includes('动态加载')) {
            loadArticleContent(articleId, targetContent);
        }
    }
}

// 加载文章内容的函数
function loadArticleContent(articleId, targetElement) {
    // 根据文章ID确定对应的HTML文件名
    const fileMap = {
        'blog': 'blog.html',
        'aicode': 'aicode.html'
    };
    const fileName = fileMap[articleId];
    if (fileName) {
        fetch(fileName)
            .then(response => {
                if (!response.ok) {
                    throw new Error('文件未找到: ' + fileName);
                }
                return response.text();
            })
            .then(html => {
                // 提取body内容（如果存在）
                const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                if (bodyMatch) {
                    targetElement.innerHTML = bodyMatch[1];
                } else {
                    // 如果没有body标签，直接使用全部内容
                    targetElement.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('加载文章失败:', error);
                targetElement.innerHTML = '<p>抱歉，无法加载文章内容。</p>';
            });
    }
}