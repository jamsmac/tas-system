-- ════════════════════════════════════════════════════════════════
--  Phase 5 — audit triggers
--  Пишут в audit_logs все INSERT/UPDATE/DELETE на ключевых таблицах.
--  diff содержит только изменившиеся поля (не дублирует full row).
-- ════════════════════════════════════════════════════════════════

create or replace function audit_trigger() returns trigger
  language plpgsql
as $$
declare
  v_diff jsonb;
  v_action text;
  v_entity_id uuid;
begin
  v_action := lower(tg_op);

  if tg_op = 'DELETE' then
    v_diff := to_jsonb(old);
    v_entity_id := (old).id;
  elsif tg_op = 'INSERT' then
    v_diff := to_jsonb(new);
    v_entity_id := (new).id;
  else
    -- UPDATE: diff = только изменившиеся поля
    select jsonb_object_agg(key, jsonb_build_object('old', old_v, 'new', new_v))
      into v_diff
      from (
        select n.key, o.value as old_v, n.value as new_v
        from jsonb_each(to_jsonb(new)) n
        join jsonb_each(to_jsonb(old)) o on o.key = n.key
        where n.value is distinct from o.value
      ) t;
    v_entity_id := (new).id;
  end if;

  if v_diff is null then
    return coalesce(new, old);
  end if;

  insert into audit_logs (organization_id, user_id, action, entity_type, entity_id, diff)
  values (
    coalesce((new).organization_id, (old).organization_id),
    current_user_id(),
    v_action,
    tg_table_name,
    v_entity_id,
    v_diff
  );

  return coalesce(new, old);
end $$;

-- Привязка к таблицам
create trigger audit_clients_t
  after insert or update or delete on clients
  for each row execute function audit_trigger();

create trigger audit_deals_t
  after insert or update or delete on deals
  for each row execute function audit_trigger();

create trigger audit_contracts_t
  after insert or update or delete on contracts
  for each row execute function audit_trigger();

create trigger audit_invoices_t
  after insert or update or delete on invoices
  for each row execute function audit_trigger();

create trigger audit_payments_t
  after insert or update or delete on payments
  for each row execute function audit_trigger();
