const ui =`<html><body>
    <div slg-progress="" class="block bg-green-600 w-full h-0.5"></div>

    <div class="grid grid-rows-[auto_1fr_160px]">
        <header class="bg-gray-100 pt-14">
            <div slg-search="" class="absolute top-1 right-1 w-[400px]">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg aria-hidden="true" class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input slg-search-input="" type="search" class="block w-full p-2 pl-10 text-sm text-gray-900 border rounded-lg bg-gray-50 outline-dashed outline-2 outline-transparent focus:outline-slate-500" placeholder="Search Mockups, Logos..." required="">
                </div>

                <div slg-dropdown-search="" active="" class="z-20 rounded shadow-md pt-1 hidden">
                    <div slg-dropdown-search-item="">
                        <p slg-title="" class="font-bold">code
                            editor with
                            CodeMirror 6</p>
                        <p slg-tags="" class=" italic">tagA</p>
                        <p slg-description="">These
                            days hands-on, in the browser, programming language tutorials are the
                            standard. They all provide some kind of code editor. People learn by typing some code
                            in
                            those</p>
                    </div>
                </div>
            </div>

            <div class="text-center">
                <label class="text-center text-4xl text-gray-500"> I'm Jerry Chaos <button slg-archive="">🗄️</button>
                    <icon slg-archive-state=""></icon>
                </label>

                <div id="aaa" class="py-4 text-gray-500 child-hover:underline child-hover:underline-offset-4">
                    <a slg-nav-home="" href="javascript:;" class="font-bold">🏠HOME</a>
                    /
                    <a slg-nav-page="" href="javascript:;" class="after:content-['▼']">How to make a code editor with
                        CodeMirrorCodeMirrorCodeMirrorCodeMirror 6</a>
                </div>
            </div>
        </header>

        <main class="w-full min-h-screen">
            <!-- <div class="flex justify-end w-full h-10 bg-yellow-100 shadow-md">
                <button type="button" class="nav-button" page-property>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </button>
            </div> -->

            <div class="flex justify-center">

                <div class="container">
                    <div slg-widget-page-new="" class="mx-4 py-3">
                        <div class="flex gap-x-1">
                            <a slg-new-article="" href="javascript:;" class="w-full py-6 px-4 rounded-lg text-3xl text-center border-dashed border-2 border-gray-400 text-gray-400 hover:text-gray-500 hover:border-gray-500">New
                                Article</a>
                            <a slg-quick-note="" href="javascript:;" class="w-full py-6 px-4 rounded-lg text-3xl text-center border-dashed border-2 border-gray-400 text-gray-400 hover:text-gray-500 hover:border-gray-500">Quick
                                Note</a>
                        </div>
                    </div>

                    <div slg-section-container="">
                        <section slg-widget-property="" class="mx-4 py-3">

                            <div slg-view="">
                                <div class="mb-2 text-2xl">
                                    <label slg-title="">How to make a code editor with CodeMirror 6</label>
                                </div>
                                <div class="mb-1">
                                    <span slg-time="" class="text-gray-500">February 16, 2023</span>
                                    <span slg-author="" class="text-gray-500">• Jerry Chaos</span>
                                </div>
                                <div slg-tags="" class="mb-3 flex gap-2">
                                    <div slg-tag="" class="bg-yellow-300 rounded-md px-3 hover:bg-yellow-400">
                                        <a href="javascript:;" class="text-gray-500 text-sm">JavaScript</a>
                                    </div>
                                </div>
                                <div slg-description="">
                                    These days hands-on, in the browser, programming language tutorials are the
                                    standard.
                                    They
                                    all
                                    provide some kind of code editor. People learn by typing some code in those editors
                                    and
                                    instant
                                    feedback tells them the outcome.
                                    What if you want to create such a platform? Especially one that works on a
                                    touchscreen and that is accessible? You want to
                                </div>
                            </div>
                            <div slg-editor="">
                                <div class="text-sm pl-1 h-6 rounded-t text-gray-300 slg-css-no-interaction">
                                    property </div>
                                <!-- <input slog-tile type="text" placeholder="title" />
                            <input slog-tag type="text" placeholder="tags ..." />
                            <textarea slog-introduction type="text" rows="5" placeholder="introduction"></textarea> -->
                                <div class="flex">
                                    <label slg-label=""> TITLE </label>
                                    <div contenteditable="" slg-focus="" slg-title="" placeholder="your page title goes here.">
                                    </div>
                                </div>
                                <div class="flex">
                                    <label slg-label=""> TAGS </label>
                                    <div contenteditable="" slg-focus="" slg-tags="" placeholder="tags, seperated with ','">
                                    </div>
                                </div>
                                <div class="flex">
                                    <label slg-label=""> DESC. </label>
                                    <div contenteditable="" slg-focus="" slg-description="" placeholder="and description. (enter to retrieve a new line)"></div>
                                </div>
                                <div class="flex">
                                    <label for="__upload-file" slg-upload="" class="hover:bg-slate-200 hover:cursor-pointer absolute w-12 mx-2 pt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-12 h-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"></path>
                                        </svg>
                                    </label>
                                    <ul slg-resources="" slg-focus="" class="py-1 pr-1 pl-16 w-full">
                                        <li slg-placeholder="" class="text-gray-400">click left button to upload your
                                            resource.</li>
                                        <li slg-resource="" class="inline-flex w-full justify-between">
                                            <div slg-title="" class="">sfsfsfsfsfsf</div>
                                            <div class="h-6 inline-flex">
                                                <button class="px-1 text-gray-400 text-sm hover:bg-slate-200" data-slg-action-name="link">link</button>
                                                <button class="px-1 text-gray-400 text-sm hover:bg-slate-200" data-slg-action-name="delete">DELETE</button>
                                            </div>
                                        </li>

                                    </ul>                                  
                                </div>
                                <form slg-form="" action="/upload" enctype="multipart/form-data" method="post">
                                    <input slg-files="" id="__upload-file" type="file" name="someExpressFiles" multiple="multiple" class="hidden">
                                </form>
                            </div>
                            <div slg-action="">
                                <button slg-new="" data-slg-action-name="new">+</button>
                                <button slg-toggle="" data-slg-action-name="toggle">toggle</button>
                                <button slg-save="" data-slg-action-name="save">save</button>
                                <button slg-delete="" data-slg-action-name="delete">delete</button>
                            </div>
                        </section>

                        <section slg-widget-markdown="" class="mx-4 py-3">
                            <div slg-view="">
                                <div>
                                    <h1 id="this-is-heading-1">this is heading 1</h1>
                                    <p>But now it’s time for an upgrade, so I started to see what code editor I
                                        should
                                        use
                                        there. I tried several code editors, but one stood out: CodeMirror. Marijn
                                        Haverbeke
                                        is doing a complete rewrite of the existing code base, and the new
                                        CodeMirror is
                                        a
                                        great piece of software. I hope this small guide will encourage you to give
                                        it a
                                        try.</p>
                                    <h2 id="this-is-heading-2">this is heading 2</h2>
                                    <p>But now it’s time for an upgrade, so I started to see what code editor I
                                        should
                                        use
                                        there. I tried several code editors, but one stood out: CodeMirror. Marijn
                                        Haverbeke
                                        is doing a complete rewrite of the existing code base, and the new
                                        CodeMirror is
                                        a
                                        great piece of software. I hope this small guide will encourage you to give
                                        it a
                                        try. </p>
                                    <p>But now it’s time for an upgrade, so I started to see what code editor I
                                        should
                                        use
                                        there. I tried several code editors, but one stood out: CodeMirror. Marijn
                                        Haverbeke
                                        is doing a complete rewrite of the existing code base, and the new
                                        CodeMirror is
                                        a
                                        great piece of software. I hope this small guide will encourage you to give
                                        it a
                                        try.</p>
                                    <h3 id="and-heading-3">and heading 3</h3>
                                    <p>But now it’s time for an upgrade, so I started to see what code editor I
                                        should
                                        use
                                        there. I tried several code editors, but one stood out: CodeMirror. Marijn
                                        Haverbeke
                                        is doing a complete rewrite of the existing code base, and the new
                                        CodeMirror is
                                        a
                                        great piece of software. I hope this small guide will encourage you to give
                                        it a
                                        try.</p>
                                    <ul>
                                        <li>What if you want to create such a platform? Especially one that works on
                                            a
                                            touchscreen and that</li>
                                        <li>pgrade, so I started to see what code editor I shoul</li>
                                        <li>enerated HTML as it would render</li>
                                        <li>etty simple.&nbsp; There's also a drop-down option above to switch
                                            between
                                            various v</li>
                                    </ul>
                                    <blockquote>
                                        <p>Hello I'm a quote</p>
                                    </blockquote>
                                    <p><a href="http://localhost:8181/?action=login">this</a> is a link to Slog
                                        login.
                                    </p>
                                    <p><img src="https://user-images.githubusercontent.com/8225057/136235657-a0ea5665-dcd1-423f-9be6-dc3f8ced8f12.png" alt="pick">
                                        <img src="https://user-images.githubusercontent.com/8225057/136235657-a0ea5665-dcd1-423f-9be6-dc3f8ced8f12.png" alt="pick">
                                    </p>
                                    <p>and some inline <code>code</code> here, 怎么样呢<code>hello\giense</code>;</p>
                                    <p>some text</p>
                                    <hr>
                                    <p><strong>BOLD ple applications using e.g. OpenGL/DirectX are provided in the
                                            examples/
                                            folder</strong></p>
                                    <p><em>itlay That's it.&nbsp; Pretty simple.&nbsp; There's also a drop-down
                                            option
                                            above
                                            to switch between various vie</em></p>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th align="center">#</th>
                                                <th align="center">name</th>
                                                <th align="center">age</th>
                                                <th align="center">address</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td align="center">1</td>
                                                <td align="center">Jerry</td>
                                                <td align="center">18</td>
                                                <td align="center">own of how to format thing</td>
                                            </tr>
                                            <tr>
                                                <td align="center">2</td>
                                                <td align="center">Nancy</td>
                                                <td align="center">18</td>
                                                <td align="center">own of hsfssggat thing</td>
                                            </tr>
                                            <tr>
                                                <td align="center">3</td>
                                                <td align="center">sb</td>
                                                <td align="center">133</td>
                                                <td align="center">own of how to format thing</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <ol>
                                        <li>Type in stuff on the left.</li>
                                        <li>See the live updates on the right.</li>
                                    </ol>
                                    <pre><code class="hljs language-cpp">void MyLowLevelMouseButtonHandler(int button, bool down)
{
    // (1) ALWAYS forward mouse data to ImGui! This is automatic with default backends. With your own backend:
    ImGuiIO&amp; io = ImGui::GetIO();
    io.AddMouseButtonEvent(button, down);
                            
    // (2) ONLY forward mouse data to your underlying app/game.
    if (!io.WantCaptureMouse)
       my_game-&gt;HandleMouseData(...);
}</code></pre>
                                    <ul>
                                        <li><strong>Preview:</strong> A live display of the generated HTML as it
                                            would
                                            render in a browser.</li>
                                        <li><strong>HTML Source:</strong> The generated HTML before your browser
                                            makes
                                            it pretty.</li>
                                        <li><strong>Lexer Data:</strong> What [marked] uses internally, in case you
                                            like gory stuff like this.</li>
                                        <li><strong>Quick Reference:</strong> A brief run-down of how to format
                                            things
                                            using markdown.</li>
                                    </ul>
                                </div>
                            </div>

                            <div slg-editor="">
                                <div class="text-sm pl-1 rounded-t text-gray-300 slg-css-no-interaction">
                                    markdown </div>
                                <div active="" slg-textarea=""> </div>
                            </div>
                            <div slg-action="">
                                <button slg-new="" data-slg-action-name="new">+</button>
                                <button slg-toggle="" data-slg-action-name="toggle">toggle</button>
                                <button slg-preview="" data-slg-action-name="preview">preview</button>
                                <button slg-save="" data-slg-action-name="save">save</button>
                                <button slg-delete="" data-slg-action-name="delete">delete</button>
                            </div>
                        </section>

                        <section slg-widget-custom="" class="mx-4 py-3">
                            <div slg-view="">
                                What if you want to create such a platform? Especially one that works on a
                                touchscreen
                                and
                                that
                                is accessible? You want to create something like Codecademy, Educative, or Codewars?
                                I
                                do so
                                that’s why I created Live JavaScript.

                                But now it’s time for an upgrade, so I started to see what code editor I should use
                                there. I
                                tried several code editors, but one stood out: CodeMirror. Marijn Haverbeke is doing
                                a
                                complete
                                rewrite of the existing code base, and the new CodeMirror is a great piece of
                                software.
                                I
                                hope
                                this small guide will encourage you to give it a try.

                                By all means, this is not an exhaustive tutorial of CodeMirror 6. There are just too
                                many
                                things
                                it can do. Maybe that is a problem, is a bit hard to find what you need. This is
                                just a
                                quick
                                get-started guide.
                            </div>

                            <div slg-action="">
                                <button slg-new="" data-slg-action-name="new">+</button>
                                <button slg-toggle="" data-slg-action-name="toggle">toggle</button>
                                <button slg-preview="" data-slg-action-name="preview">preview</button>
                                <button slg-save="" data-slg-action-name="save">save</button>
                                <button slg-delete="" data-slg-action-name="delete">delete</button>
                                <button slg-save-template="" data-slg-action-name="template">template</button>
                            </div>

                            <div slg-editor="">
                                <div class="rounded-t w-full slg-css-no-interaction">
                                    <div class="flex justify-between text-sm">
                                        <div class="pl-1 rounded-t text-gray-300">custom</div>
                                        <div slg-buttons="" class="inline-flex h-5 pointer-events-auto">
                                            <button slg-button-content="" data-slg-button="content" active="" class="rounded-bl">content </button>
                                            <button slg-button-layout="" data-slg-button="layout"> layout </button>
                                            <button slg-button-action="" data-slg-button="action" class="rounded-tr">
                                                action
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div slg-textareas="">
                                    <div slg-textarea="" slg-textarea-content="" active=""> </div>
                                    <div slg-textarea="" slg-textarea-layout=""> </div>
                                    <div slg-textarea="" slg-textarea-action=""> </div>
                                </div>
                            </div>

                        </section>
                    </div>
                </div>
            </div>

        </main>

        <footer id="ID-footer" class="text-center bg-gray-100 py-14">
            <label class="text-gray-500">
                Copyright ©️ 2010 - 2022 Jerry Chaos
            </label>
        </footer>
    </div>

    <div slg-dropdown-widgets="" class="fixed top-0 left-0 z-10 rounded-md shadow-md" role="tooltip">
        <div class="bg-slate-200 z-10 w-44">
            <ul class="py-2 text-sm text-gray-700">
                <li> <a data-slg-menu="markdown">Markdown</a> </li>
                <li> <a data-slg-menu="custom">Custom</a> </li>
            </ul>
        </div>
    </div>

    <div slg-dropdown-nav="" class="absolute z-10 rounded-md shadow-md" role="tooltip">
        <div class="bg-slate-200 min-w-[350px] max-w-[350px]">
            <ul class="py-2 text-sm text-gray-700">
                <li data-slg-pid="pid-pid-pid" class="w-full inline-flex content-between items-center">
                    <a slg-title="" class="grow">How ith Coor 6</a>
                    <button slg-remove="" class="bg-transparent rounded-md p-1 mr-1 text-slate-300 hover:text-slate-400 uppercase text-sm">RM</button>
                </li>
            </ul>
        </div>
    </div>

    <div slg-dropdown-template="" class="fixed top-0 left-0 z-10 rounded-md shadow-md" role="tooltip">
        <div class="bg-slate-200 p-3 min-w-[350px]">

            <div class="flex items-center">
                <label slg-textarea-p=""> NAME : </label>
                <div contenteditable="" slg-focus="" class="p-1 pl-20" placeholder="name of your template.">
                </div>
            </div>

            <div class="w-full p-1 flex justify-center items-center">
                <input id="cb-content" type="checkbox">
                <label for="cb-content">save content</label>
                <input checked="" id="cb-layout" type="checkbox" class="ml-4">
                <label for="cb-layout">save layout</label>
                <input checked="" id="cb-action" type="checkbox" class="ml-4">
                <label for="cb-action">save action</label>
            </div>

            <div class="w-full inline-flex justify-center pt-2 pb-2 px-1">
                <button slg-btn="" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded inline-flex items-center">
                    <svg class="fill-white w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"></path>
                    </svg>
                    Save Template
                </button>
            </div>
        </div>
    </div>

    <div slg-common-alert="" class="fixed top-0 left-0 rounded-md shadow-md" role="tooltip">
        <div class="bg-slate-200 z-11 px-7 py-5 min-w-[200px]">
            <label slg-msg="">are you sure to delete?</label>
            <center class="mt-4">
                <button slg-comfirm="" class="px-2 py-1 rounded-md bg-red-800 hover:bg-red-900 text-gray-100">Comfirm</button>
            </center>
        </div>
    </div>



<script src="./ui.js">
</script>










</body></html>`;export default ui;