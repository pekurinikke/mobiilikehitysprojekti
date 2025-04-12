using UnityEngine;
using System.Collections;

public class FlyingEnemyController : EnemyController
{
    private Vector3 delayedTargetPosition;
    private bool isDiving = false;

    public override void Start()
    {
        base.Start();
        //Speed = 10f;
    }

    public override void HandleIdleState()
    {
        base.HandleIdleState();
        Collider2D player = Physics2D.OverlapCircle(transform.position, detectionRadius, playerLayer);

        // Mikäli pelaaja on havainnointialueella, tallennetaan sijainti ja aloitetaan jahtaaminen
        if (player != null && !isDiving)
        {
            StartCoroutine(DiveTowardsTarget());
            currentState = State.Aggressive;
        }
    }

    public override void HandleReturningHomeState()
    {
        float distanceToHome = Vector3.Distance(transform.position, homePosition);

        // Tarkistaa onko 0.3f alueella kotipistettä, jos ei, jatkaa matkaa kotia päin
        if (distanceToHome > 0.3f)
        {
            MoveTowardsHome();
        }
        else
        {
            currentState = State.Idle;
        }
    }

    private IEnumerator DiveTowardsTarget()
    {
        isDiving = true;
        Collider2D player = Physics2D.OverlapCircle(transform.position, detectionRadius, playerLayer);

        yield return new WaitForSeconds(2f);
        delayedTargetPosition = player.transform.position;

        while (Vector3.Distance(transform.position, delayedTargetPosition) > 0.3f)
        {
            transform.position = Vector3.MoveTowards(transform.position, delayedTargetPosition, 10f * Time.deltaTime);
            yield return null;
        }

        yield return new WaitForSeconds(0.5f);

        target = null;
        currentState = State.ReturningHome;

        isDiving = false;
    }

    protected override void MoveTowardsTarget()
    {
        // Käyttää omaa liikkumista ylempänä
    }
}
