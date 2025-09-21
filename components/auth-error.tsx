'use client';'use client';'use client';import { Button } from '@/components/ui/button';/**



import { Button } from '@/components/ui/button';

import type { AuthError } from '@/types/auth';

import { AlertTriangle, RefreshCw } from 'lucide-react';import { Button } from '@/components/ui/button';



interface AuthErrorProps {import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

  error: AuthError;

  showRetry?: boolean;import { useAuth } from '@/lib/auth-context';import { Button } from '@/components/ui/button';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; * Authentication Error Display Component

  onRetry?: () => void;

  onDismiss?: () => void;import { getErrorAction } from '@/lib/auth-errors';

  className?: string;

}import type { AuthError } from '@/types/auth';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';



export function AuthError({import { AlertTriangle, RefreshCw, WifiOff, Clock, X } from 'lucide-react';

  error,

  showRetry = false,import { useAuth } from '@/lib/auth-context';import { useAuth } from '@/lib/auth-context'; * Shows comprehensive error messages with user-friendly guidance

  onRetry,

  onDismiss,interface AuthErrorProps {

  className = '',

}: AuthErrorProps) {  error: AuthError;import { getErrorAction } from '@/lib/auth-errors';

  return (

    <div className={`border border-destructive/20 bg-destructive/5 rounded-lg p-4 ${className}`} role="alert">  variant?: 'inline' | 'modal' | 'toast';

      <div className="flex items-start space-x-3">

        <AlertTriangle className="h-5 w-5 text-destructive" />  showRetry?: boolean;import type { AuthError } from '@/types/auth';import { getErrorAction } from '@/lib/auth-errors'; * Based on auth-errors.ts utilities and accessibility requirements

        <div className="flex-1">

          <h4 className="text-sm font-medium text-destructive">  onRetry?: () => void;

            {error.message || 'Ett fel uppstod'}

          </h4>  onDismiss?: () => void;import { AlertTriangle, RefreshCw, WifiOff, Clock, X } from 'lucide-react';

          <div className="flex gap-2 mt-3">

            {showRetry && onRetry && (  className?: string;

              <Button

                onClick={onRetry}}import type { AuthError } from '@/types/auth'; */

                variant="outline"

                size="sm"

              >

                <RefreshCw className="h-3 w-3 mr-1" />export function AuthError({interface AuthErrorProps {

                Försök igen

              </Button>  error,

            )}

            {onDismiss && (  variant = 'inline',  error: AuthError;import { AlertTriangle, RefreshCw, WifiOff, Clock, X } from 'lucide-react';

              <Button

                onClick={onDismiss}  showRetry = false,

                variant="ghost"

                size="sm"  onRetry,  variant?: 'inline' | 'modal' | 'toast';

              >

                Stäng  onDismiss,

              </Button>

            )}  className = '',  showRetry?: boolean;'use client';

          </div>

        </div>}: AuthErrorProps) {

      </div>

    </div>  const action = getErrorAction(error);  onRetry?: () => void;

  );

}

  const getErrorIcon = () => {  onDismiss?: () => void;interface AuthErrorProps {

    switch (error.code) {

      case 'NETWORK_ERROR':  className?: string;

      case 'SERVICE_UNAVAILABLE':

        return <WifiOff className="h-5 w-5 text-destructive" />;}  error: AuthError;import { Button } from '@/components/ui/button';

      case 'SESSION_EXPIRED':

      case 'TOKEN_INVALID':

        return <Clock className="h-5 w-5 text-destructive" />;

      default:export function AuthError({  variant?: 'inline' | 'modal' | 'toast';import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

        return <AlertTriangle className="h-5 w-5 text-destructive" />;

    }  error,

  };

  variant = 'inline',  showRetry?: boolean;import { useAuth } from '@/lib/auth-context';

  const getErrorTitle = (error: AuthError): string => {

    switch (error.code) {  showRetry = false,

      case 'INVALID_CREDENTIALS':

        return 'Felaktiga inloggningsuppgifter';  onRetry,  onRetry?: () => void;import { getErrorAction } from '@/lib/auth-errors';

      case 'NETWORK_ERROR':

        return 'Nätverksproblem';  onDismiss,

      case 'SERVICE_UNAVAILABLE':

        return 'Tjänsten är inte tillgänglig';  className = '',  onDismiss?: () => void;import type { AuthError } from '@/types/auth';

      case 'SESSION_EXPIRED':

        return 'Sessionen har gått ut';}: AuthErrorProps) {

      case 'TOKEN_INVALID':

        return 'Ogiltig session';  const { clearError } = useAuth();  className?: string;import { AlertTriangle, RefreshCw, WifiOff, Clock, X } from 'lucide-react';

      case 'VALIDATION_ERROR':

        return 'Felaktig inmatning';  const action = getErrorAction(error);

      case 'RATE_LIMITED':

        return 'För många försök';}

      case 'UNKNOWN_ERROR':

      default:  const getErrorIcon = () => {

        return 'Ett oväntat fel uppstod';

    }    switch (error.code) {interface AuthErrorProps {

  };

      case 'NETWORK_ERROR':

  const getErrorDescription = (error: AuthError): string => {

    switch (error.code) {      case 'SERVICE_UNAVAILABLE':export function AuthError({  error?: AuthError | null;

      case 'INVALID_CREDENTIALS':

        return 'Kontrollera ditt användarnamn och lösenord och försök igen.';        return <WifiOff className="h-5 w-5 text-destructive" />;

      case 'NETWORK_ERROR':

        return 'Kontrollera din internetanslutning och försök igen.';      case 'SESSION_EXPIRED':  error,  onRetry?: () => void;

      case 'SERVICE_UNAVAILABLE':

        return 'Systemet är tillfälligt otillgängligt. Försök igen om en stund.';      case 'TOKEN_INVALID':

      case 'SESSION_EXPIRED':

        return 'Din session har gått ut. Logga in igen för att fortsätta.';        return <Clock className="h-5 w-5 text-destructive" />;  variant = 'inline',  onDismiss?: () => void;

      case 'TOKEN_INVALID':

        return 'Din session är ogiltig. Logga in igen.';      default:

      case 'VALIDATION_ERROR':

        return 'Kontrollera att alla fält är korrekt ifyllda.';        return <AlertTriangle className="h-5 w-5 text-destructive" />;  showRetry = false,  className?: string;

      case 'RATE_LIMITED':

        return 'Du har gjort för många inloggningsförsök. Vänta en stund innan du försöker igen.';    }

      case 'UNKNOWN_ERROR':

      default:  };  onRetry,  variant?: 'inline' | 'card' | 'toast';

        return error.message || 'Ett oväntat fel uppstod. Försök igen eller kontakta support.';

    }

  };

  const getErrorTitle = (error: AuthError): string => {  onDismiss,}

  if (variant === 'modal') {

    return (    switch (error.code) {

      <Card className={`border-destructive ${className}`}>

        <CardHeader>      case 'INVALID_CREDENTIALS':  className = '',

          <CardTitle className="text-destructive">Fel uppstod</CardTitle>

        </CardHeader>        return 'Felaktiga inloggningsuppgifter';

        <CardContent>

          <div className="flex items-start space-x-4">      case 'NETWORK_ERROR':}: AuthErrorProps) {const errorIcons = {

            {getErrorIcon()}

            <div className="flex-1">        return 'Nätverksproblem';

              <h3 className="text-lg font-semibold text-destructive">

                {getErrorTitle(error)}      case 'SERVICE_UNAVAILABLE':  const { clearError } = useAuth();  NETWORK: WifiOff,

              </h3>

              <p className="text-sm text-muted-foreground mt-2">        return 'Tjänsten är inte tillgänglig';

                {getErrorDescription(error)}

              </p>      case 'SESSION_EXPIRED':  const action = getErrorAction(error);  INVALID_CREDENTIALS: X,

              {action && (

                <div className="flex gap-2 mt-4">        return 'Sessionen har gått ut';

                  <Button onClick={action.handler} variant="outline">

                    {action.label}      case 'TOKEN_INVALID':  TIMEOUT: Clock,

                  </Button>

                  {onDismiss && (        return 'Ogiltig session';

                    <Button onClick={onDismiss} variant="secondary">

                      Stäng      case 'VALIDATION_ERROR':  const getErrorIcon = () => {  SERVER_ERROR: AlertTriangle,

                    </Button>

                  )}        return 'Felaktig inmatning';

                </div>

              )}      case 'RATE_LIMITED':    switch (error.code) {};

            </div>

            {onDismiss && (        return 'För många försök';

              <Button

                onClick={onDismiss}      case 'UNKNOWN_ERROR':      case 'NETWORK_ERROR':

                variant="ghost"

                size="icon"      default:

                className="h-6 w-6"

              >        return 'Ett oväntat fel uppstod';      case 'SERVICE_UNAVAILABLE':const errorColors = {

                <X className="h-4 w-4" />

              </Button>    }

            )}

          </div>  };        return <WifiOff className="h-5 w-5 text-destructive" />;  NETWORK: 'text-orange-600',

        </CardContent>

      </Card>

    );

  }  const getErrorDescription = (error: AuthError): string => {      case 'SESSION_EXPIRED':  INVALID_CREDENTIALS: 'text-red-600',



  if (variant === 'toast') {    switch (error.code) {

    return (

      <div className={`border border-destructive bg-destructive/5 rounded-lg p-3 ${className}`} role="alert">      case 'INVALID_CREDENTIALS':      case 'TOKEN_INVALID':  TIMEOUT: 'text-yellow-600',

        <div className="flex items-start space-x-2">

          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />        return 'Kontrollera ditt användarnamn och lösenord och försök igen.';

          <div className="flex-1">

            <p className="text-sm font-medium text-destructive">Fel</p>      case 'NETWORK_ERROR':        return <Clock className="h-5 w-5 text-destructive" />;  SERVER_ERROR: 'text-red-600',

            <p className="text-sm text-muted-foreground">

              {error.message}        return 'Kontrollera din internetanslutning och försök igen.';

            </p>

            {showRetry && (      case 'SERVICE_UNAVAILABLE':      default:};

              <Button

                size="sm"        return 'Systemet är tillfälligt otillgängligt. Försök igen om en stund.';

                variant="outline"

                onClick={onRetry}      case 'SESSION_EXPIRED':        return <AlertTriangle className="h-5 w-5 text-destructive" />;

                className="mt-2"

              >        return 'Din session har gått ut. Logga in igen för att fortsätta.';

                Försök igen

              </Button>      case 'TOKEN_INVALID':    }export function AuthError({ 

            )}

          </div>        return 'Din session är ogiltig. Logga in igen.';

        </div>

      </div>      case 'VALIDATION_ERROR':  };  error, 

    );

  }        return 'Kontrollera att alla fält är korrekt ifyllda.';



  // Default inline variant      case 'RATE_LIMITED':  onRetry, 

  return (

    <div className={`border border-destructive/20 bg-destructive/5 rounded-lg p-4 ${className}`} role="alert">        return 'Du har gjort för många inloggningsförsök. Vänta en stund innan du försöker igen.';

      <div className="flex items-start space-x-3">

        {getErrorIcon()}      case 'UNKNOWN_ERROR':  const getErrorTitle = (error: AuthError): string => {  onDismiss, 

        <div className="flex-1">

          <h4 className="text-sm font-medium text-destructive">      default:

            {getErrorTitle(error)}

          </h4>        return error.message || 'Ett oväntat fel uppstod. Försök igen eller kontakta support.';    switch (error.code) {  className = '',

          <p className="text-sm text-muted-foreground mt-1">

            {getErrorDescription(error)}    }

          </p>

          <div className="flex gap-2 mt-3">  };      case 'INVALID_CREDENTIALS':  variant = 'inline' 

            {action && (

              <Button

                onClick={action.handler}

                variant="outline"  if (variant === 'modal') {        return 'Felaktiga inloggningsuppgifter';}: AuthErrorProps) {

                size="sm"

              >    return (

                {action.label}

              </Button>      <Card className={`border-destructive ${className}`}>      case 'NETWORK_ERROR':  const { clearError } = useAuth();

            )}

            {showRetry && onRetry && (        <CardHeader>

              <Button

                onClick={onRetry}          <CardTitle className="text-destructive">Fel uppstod</CardTitle>        return 'Nätverksproblem';

                variant="outline"

                size="sm"        </CardHeader>

              >

                <RefreshCw className="h-3 w-3 mr-1" />        <CardContent>      case 'SERVICE_UNAVAILABLE':  if (!error) return null;

                Försök igen

              </Button>          <div className="flex items-start space-x-4">

            )}

            {onDismiss && (            {getErrorIcon()}        return 'Tjänsten är inte tillgänglig';

              <Button

                onClick={onDismiss}            <div className="flex-1">

                variant="ghost"

                size="sm"              <h3 className="text-lg font-semibold text-destructive">      case 'SESSION_EXPIRED':  const Icon = errorIcons[error.type] || AlertTriangle;

              >

                Stäng                {getErrorTitle(error)}

              </Button>

            )}              </h3>        return 'Sessionen har gått ut';  const iconColor = errorColors[error.type] || 'text-red-600';

          </div>

        </div>              <p className="text-sm text-muted-foreground mt-2">

        {onDismiss && (

          <Button                {getErrorDescription(error)}      case 'TOKEN_INVALID':  const showRetry = error.retryable && onRetry;

            onClick={onDismiss}

            variant="ghost"              </p>

            size="icon"

            className="h-6 w-6"              {action && (        return 'Ogiltig session';  const action = getErrorAction(error);

          >

            <X className="h-4 w-4" />                <div className="flex gap-2 mt-4">

          </Button>

        )}                  <Button onClick={action.handler} variant="outline">      case 'VALIDATION_ERROR':

      </div>

    </div>                    {action.label}

  );

}                  </Button>        return 'Felaktig inmatning';  const handleDismiss = () => {

                  {onDismiss && (

                    <Button onClick={onDismiss} variant="secondary">      case 'RATE_LIMITED':    if (onDismiss) {

                      Stäng

                    </Button>        return 'För många försök';      onDismiss();

                  )}

                </div>      case 'UNKNOWN_ERROR':    } else {

              )}

            </div>      default:      clearError();

            {onDismiss && (

              <Button        return 'Ett oväntat fel uppstod';    }

                onClick={onDismiss}

                variant="ghost"    }  };

                size="icon"

                className="h-6 w-6"  };

              >

                <X className="h-4 w-4" />  const content = (

              </Button>

            )}  const getErrorDescription = (error: AuthError): string => {    <>

          </div>

        </CardContent>    switch (error.code) {      <div className="flex items-start gap-3">

      </Card>

    );      case 'INVALID_CREDENTIALS':        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`} aria-hidden="true" />

  }

        return 'Kontrollera ditt användarnamn och lösenord och försök igen.';        <div className="flex-1 space-y-2">

  if (variant === 'toast') {

    return (      case 'NETWORK_ERROR':          <div>

      <div className={`border border-destructive bg-destructive/5 rounded-lg p-3 ${className}`} role="alert">

        <div className="flex items-start space-x-2">        return 'Kontrollera din internetanslutning och försök igen.';            <h4 className="font-medium text-foreground">

          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />

          <div className="flex-1">      case 'SERVICE_UNAVAILABLE':              {getErrorTitle(error.type)}

            <p className="text-sm font-medium text-destructive">Fel</p>

            <p className="text-sm text-muted-foreground">        return 'Systemet är tillfälligt otillgängligt. Försök igen om en stund.';            </h4>

              {error.message}

            </p>      case 'SESSION_EXPIRED':            <p className="text-sm text-muted-foreground mt-1">

            {showRetry && (

              <Button        return 'Din session har gått ut. Logga in igen för att fortsätta.';              {error.message}

                size="sm"

                variant="outline"      case 'TOKEN_INVALID':            </p>

                onClick={onRetry}

                className="mt-2"        return 'Din session är ogiltig. Logga in igen.';          </div>

              >

                Försök igen      case 'VALIDATION_ERROR':          

              </Button>

            )}        return 'Kontrollera att alla fält är korrekt ifyllda.';          {/* Action guidance */}

          </div>

        </div>      case 'RATE_LIMITED':          <div className="text-sm text-muted-foreground">

      </div>

    );        return 'Du har gjort för många inloggningsförsök. Vänta en stund innan du försöker igen.';            <strong>Vad kan du göra:</strong> {action}

  }

      case 'UNKNOWN_ERROR':          </div>

  // Default inline variant

  return (      default:          

    <div className={`border border-destructive/20 bg-destructive/5 rounded-lg p-4 ${className}`} role="alert">

      <div className="flex items-start space-x-3">        return error.message || 'Ett oväntat fel uppstod. Försök igen eller kontakta support.';          {/* Action buttons */}

        {getErrorIcon()}

        <div className="flex-1">    }          <div className="flex items-center gap-2 pt-2">

          <h4 className="text-sm font-medium text-destructive">

            {getErrorTitle(error)}  };            {showRetry && (

          </h4>

          <p className="text-sm text-muted-foreground mt-1">              <Button

            {getErrorDescription(error)}

          </p>  if (variant === 'modal') {                size="sm"

          <div className="flex gap-2 mt-3">

            {action && (    const content = (                variant="outline"

              <Button

                onClick={action.handler}      <>                onClick={onRetry}

                variant="outline"

                size="sm"        <div className="flex items-start space-x-4">                className="flex items-center gap-2"

              >

                {action.label}          {getErrorIcon()}              >

              </Button>

            )}          <div className="flex-1">                <RefreshCw className="h-4 w-4" />

            {showRetry && onRetry && (

              <Button            <h3 className="text-lg font-semibold text-destructive">                Försök igen

                onClick={onRetry}

                variant="outline"              {getErrorTitle(error)}              </Button>

                size="sm"

              >            </h3>            )}

                <RefreshCw className="h-3 w-3 mr-1" />

                Försök igen            <p className="text-sm text-muted-foreground mt-2">            <Button

              </Button>

            )}              {getErrorDescription(error)}              size="sm"

            {onDismiss && (

              <Button            </p>              variant="ghost"

                onClick={onDismiss}

                variant="ghost"            {action && (              onClick={handleDismiss}

                size="sm"

              >              <div className="flex gap-2 mt-4">              className="text-muted-foreground hover:text-foreground"

                Stäng

              </Button>                <Button onClick={action.handler} variant="outline">            >

            )}

          </div>                  {action.label}              Stäng

        </div>

        {onDismiss && (                </Button>            </Button>

          <Button

            onClick={onDismiss}                {onDismiss && (          </div>

            variant="ghost"

            size="icon"                  <Button onClick={onDismiss} variant="secondary">        </div>

            className="h-6 w-6"

          >                    Stäng      </div>

            <X className="h-4 w-4" />

          </Button>                  </Button>    </>

        )}

      </div>                )}  );

    </div>

  );              </div>

}
            )}  if (variant === 'card') {

          </div>    return (

          {onDismiss && (      <Card className={`border-destructive ${className}`}>

            <Button        <CardHeader className="pb-3">

              onClick={onDismiss}          <CardTitle className="text-destructive">Autentiseringsfel</CardTitle>

              variant="ghost"        </CardHeader>

              size="icon"        <CardContent>

              className="h-6 w-6"          {content}

            >        </CardContent>

              <X className="h-4 w-4" />      </Card>

            </Button>    );

          )}  }

        </div>

      </>  if (variant === 'toast') {

    );    return (

      <Alert className={`border-destructive ${className}`} role="alert">

    return (        <AlertTriangle className="h-4 w-4" />

      <Card className={`border-destructive ${className}`}>        <AlertTitle>Fel</AlertTitle>

        <CardHeader>        <AlertDescription>

          <CardTitle className="text-destructive">Fel uppstod</CardTitle>          {error.message}

        </CardHeader>          {showRetry && (

        <CardContent>            <Button

          {content}              size="sm"

        </CardContent>              variant="outline"

      </Card>              onClick={onRetry}

    );              className="ml-2"

  }            >

              Försök igen

  if (variant === 'toast') {            </Button>

    return (          )}

      <div className={`border border-destructive bg-destructive/5 rounded-lg p-3 ${className}`} role="alert">        </AlertDescription>

        <div className="flex items-start space-x-2">      </Alert>

          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />    );

          <div className="flex-1">  }

            <p className="text-sm font-medium text-destructive">Fel</p>

            <p className="text-sm text-muted-foreground">  // Default inline variant

              {error.message}  return (

            </p>    <div className={`border border-destructive/20 bg-destructive/5 rounded-lg p-4 ${className}`} role="alert">

            {showRetry && (      {content}

              <Button    </div>

                size="sm"  );

                variant="outline"}

                onClick={onRetry}

                className="mt-2"/**

              > * Get user-friendly error title based on error type

                Försök igen */

              </Button>function getErrorTitle(errorType: AuthError['type']): string {

            )}  switch (errorType) {

          </div>    case 'NETWORK':

        </div>      return 'Anslutningsproblem';

      </div>    case 'INVALID_CREDENTIALS':

    );      return 'Ogiltiga inloggningsuppgifter';

  }    case 'TIMEOUT':

      return 'Begäran tog för lång tid';

  // Default inline variant    case 'SERVER_ERROR':

  return (      return 'Serverfel';

    <div className={`border border-destructive/20 bg-destructive/5 rounded-lg p-4 ${className}`} role="alert">    default:

      <div className="flex items-start space-x-3">      return 'Okänt fel';

        {getErrorIcon()}  }

        <div className="flex-1">}

          <h4 className="text-sm font-medium text-destructive">

            {getErrorTitle(error)}/**

          </h4> * Specialized error component for network issues

          <p className="text-sm text-muted-foreground mt-1"> */

            {getErrorDescription(error)}export function NetworkError({ onRetry }: { onRetry?: () => void }) {

          </p>  return (

          <div className="flex gap-2 mt-3">    <div className="flex flex-col items-center gap-4 p-6 text-center">

            {action && (      <div className="rounded-full bg-orange-100 p-4">

              <Button        <WifiOff className="h-8 w-8 text-orange-600" />

                onClick={action.handler}      </div>

                variant="outline"      <div className="space-y-2">

                size="sm"        <h3 className="font-medium">Ingen internetanslutning</h3>

              >        <p className="text-sm text-muted-foreground">

                {action.label}          Kontrollera din internetanslutning och försök igen.

              </Button>        </p>

            )}      </div>

            {showRetry && onRetry && (      {onRetry && (

              <Button        <Button onClick={onRetry} className="flex items-center gap-2">

                onClick={onRetry}          <RefreshCw className="h-4 w-4" />

                variant="outline"          Försök igen

                size="sm"        </Button>

              >      )}

                <RefreshCw className="h-3 w-3 mr-1" />    </div>

                Försök igen  );

              </Button>}

            )}

            {onDismiss && (/**

              <Button * Hook to provide authentication error state

                onClick={onDismiss} */

                variant="ghost"export function useAuthError() {

                size="sm"  const { state, clearError } = useAuth();

              >  

                Stäng  return {

              </Button>    error: state.error,

            )}    hasError: !!state.error,

          </div>    isNetworkError: state.error?.type === 'NETWORK',

        </div>    isCredentialsError: state.error?.type === 'INVALID_CREDENTIALS',

        {onDismiss && (    isRetryable: !!state.error?.retryable,

          <Button    clearError,

            onClick={onDismiss}  };

            variant="ghost"}

            size="icon"

            className="h-6 w-6"export default AuthError;
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
