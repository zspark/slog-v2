const ui =`<html><body>

    <div slg-login="" class="row-start-3 col-start-2 flex justify-center items-center">
        <div class="p-8 w-80 bg-slate-300 flex flex-col gap-2">
            <input type="email" name="account" placeholder="name@company.com" required="" class="w-full">
            <input type="password" name="pwd" placeholder="••••••••" required="" class="w-full">
            <div class="flex items-center">
                <input id="remember" type="checkbox" name="rem" value="" required="">
                <label for="remember">remember me</label>
            </div>
            <button slg-login-button="" class="inline-flex items-center justify-center bg-slate-400 rounded-md p-1 hover:bg-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                    <circle style="opacity: 0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                    </circle>
                    <path style="opacity: 0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                Login to your account
            </button>
        </div>
    </div>





</body></html>`;export default ui;