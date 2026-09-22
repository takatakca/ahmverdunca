DROP FUNCTION IF EXISTS public.handle_new_user();

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.can_manage(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage(uuid, public.app_role) TO authenticated, service_role;